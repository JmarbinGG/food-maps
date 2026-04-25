"""
DoGoods AI Conversation Engine — MySQL edition.

Ported from the Supabase version. Talks to:
  - OpenAI GPT-4o (reasoning + tool calls)
  - OpenAI Whisper (speech-to-text)
  - OpenAI TTS (text-to-speech)

Conversation history, profile, and reminders come from the main MySQL database
via SQLAlchemy (no Supabase).
"""
from __future__ import annotations


import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import httpx
from dotenv import load_dotenv

# Load .env from project root
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_engine")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = "https://api.openai.com/v1"
CHAT_MODEL = os.getenv("AI_CHAT_MODEL", "gpt-4o-mini")
FOLLOWUP_MODEL = os.getenv("AI_FOLLOWUP_MODEL", "gpt-4o-mini")
WHISPER_MODEL = "whisper-1"
TTS_MODEL = "tts-1"
TTS_VOICE_EN = os.getenv("AI_TTS_VOICE", "nova")
TTS_VOICE_ES = os.getenv("AI_TTS_VOICE_ES", "nova")

MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", "2"))
TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT", "30"))

RATE_LIMIT_DEFAULT = int(os.getenv("AI_RATE_LIMIT", "50"))
RATE_LIMIT_WINDOW = 60

TRAINING_DATA_PATH = os.path.join(os.path.dirname(__file__), "ai_training_data.json")

# Shared HTTP client
_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client(timeout: float = TIMEOUT_SECONDS) -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=timeout)
    return _http_client


async def close_http_client() -> None:
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()


# ---------------------------------------------------------------------------
# Spanish detection
# ---------------------------------------------------------------------------

_SPANISH_MARKERS = {
    "hola", "gracias", "por favor", "ayuda", "comida", "buscar",
    "quiero", "necesito", "dónde", "donde", "cómo", "como",
    "cuándo", "cuando", "tengo", "puedo", "buenos", "buenas",
    "qué", "que", "disponible", "recoger", "compartir",
    "alimentos", "comunidad", "recordatorio", "horario",
    "muéstrame", "muestrame", "muestra", "mostrar", "dame",
    "panel", "mi", "tu", "para", "con", "sin", "una", "uno",
    "soy", "eres", "estoy", "está", "ser", "hacer", "tiene",
}


def detect_spanish(text: str) -> bool:
    lower = text.lower()
    words = set(re.split(r"\W+", lower))
    marker_hits = len(words & _SPANISH_MARKERS)
    # Spanish-specific punctuation is a strong standalone signal
    if re.search(r"[¿¡ñ]", lower):
        return True
    # Two or more accented Latin chars → very likely Spanish
    accent_hits = len(re.findall(r"[áéíóúü]", lower))
    if accent_hits >= 2:
        return True
    has_accent = accent_hits >= 1
    return marker_hits >= 2 or (marker_hits >= 1 and has_accent)


# ---------------------------------------------------------------------------
# Canned fallback responses
# ---------------------------------------------------------------------------

CANNED_RESPONSES = {
    "en": {
        "timeout": "I'm taking longer than usual — please try again in a moment. In the meantime you can browse food on the Find Food page.",
        "api_down": "I can't reach my AI service right now. You can still browse listings and check your dashboard — I'll be back shortly!",
        "general_error": "Something went wrong on my end. Please try again, or contact support if the issue persists.",
        "tool_error": "I couldn't look that up right now, but I can still help with general questions.",
    },
    "es": {
        "timeout": "Estoy tardando más de lo normal — inténtalo de nuevo en un momento. Mientras tanto puedes explorar comida en Buscar Comida.",
        "api_down": "No puedo conectarme a mi servicio de IA en este momento. Aún puedes explorar los listados y revisar tu panel.",
        "general_error": "Algo salió mal. Inténtalo de nuevo o contacta a soporte.",
        "tool_error": "No pude buscar esa información, pero puedo ayudarte con preguntas generales.",
    },
}


def get_canned_response(error_type: str, lang: str = "en") -> str:
    lang_key = "es" if lang == "es" else "en"
    return CANNED_RESPONSES[lang_key].get(error_type, CANNED_RESPONSES[lang_key]["general_error"])


# ---------------------------------------------------------------------------
# Rate limiter (per-IP, in-memory)
# ---------------------------------------------------------------------------

_rate_store: dict[str, list[float]] = {}


def check_rate_limit(client_ip: str, limit: int = RATE_LIMIT_DEFAULT) -> bool:
    now = time.time()
    timestamps = _rate_store.setdefault(client_ip, [])
    _rate_store[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(_rate_store[client_ip]) >= limit:
        return False
    _rate_store[client_ip].append(now)
    return True


# ---------------------------------------------------------------------------
# Circuit breaker
# ---------------------------------------------------------------------------

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time: float = 0

    def record_success(self) -> None:
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def allow_request(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.reset_timeout:
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        return True


_circuit = CircuitBreaker()


# ---------------------------------------------------------------------------
# OpenAI request helper
# ---------------------------------------------------------------------------

async def _openai_with_retry(
    method: str,
    url: str,
    *,
    headers: dict,
    json_payload: dict | None = None,
    files: dict | None = None,
    data: dict | None = None,
    timeout: float = TIMEOUT_SECONDS,
    retries: int = MAX_RETRIES,
) -> httpx.Response:
    NON_RETRYABLE = {401, 403, 404, 422}
    last_exc: Exception | None = None

    for attempt in range(retries):
        try:
            client = _get_http_client(timeout)
            kwargs: dict = {"headers": headers}
            if json_payload is not None:
                kwargs["json"] = json_payload
            if files is not None:
                kwargs["files"] = files
            if data is not None:
                kwargs["data"] = data

            resp = await client.request(method, url, **kwargs)

            if resp.status_code == 429:
                _circuit.record_failure()
                await asyncio.sleep(min(2 ** attempt + 1, 10))
                continue
            if resp.status_code in NON_RETRYABLE:
                resp.raise_for_status()
            if resp.status_code >= 500:
                _circuit.record_failure()
                await asyncio.sleep(min(2 ** attempt + 1, 10))
                continue

            resp.raise_for_status()
            _circuit.record_success()
            return resp
        except httpx.HTTPStatusError:
            raise
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            last_exc = exc
            _circuit.record_failure()
            if attempt < retries - 1:
                await asyncio.sleep(min(2 ** attempt + 1, 10))

    raise RuntimeError(f"OpenAI request failed after {retries} attempts: {last_exc}")


def _extract_content(response: dict) -> str:
    try:
        return response["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError("Unexpected AI response format") from exc


async def legacy_ai_request(endpoint: str, payload: dict) -> dict:
    """Fire a simple OpenAI chat/completions call (used by recipes, storage tips)."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not configured")
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    resp = await _openai_with_retry(
        "POST",
        f"{OPENAI_BASE_URL}{endpoint}",
        headers=headers,
        json_payload=payload,
    )
    return resp.json()


# ---------------------------------------------------------------------------
# Training data + system prompt builder
# ---------------------------------------------------------------------------

def _load_training_data() -> dict:
    try:
        with open(TRAINING_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning("Training data not found: %s", TRAINING_DATA_PATH)
        return {}


def _build_system_prompt(training_data: dict) -> str:
    sections: list[str] = []

    if "platform_overview" in training_data:
        sections.append(f"## Platform Overview\n{training_data['platform_overview']}")

    if "user_roles" in training_data:
        roles = "\n".join(
            f"- **{r['role']}**: {r['description']}"
            for r in training_data["user_roles"]
        )
        sections.append(f"## User Roles\n{roles}")

    if "processes" in training_data:
        procs = "\n".join(f"- {p}" for p in training_data["processes"])
        sections.append(f"## Key Processes\n{procs}")

    if "food_safety" in training_data:
        safety = "\n".join(f"- {s}" for s in training_data["food_safety"])
        sections.append(f"## Food Safety Guidelines\n{safety}")

    if "tone_guidelines" in training_data:
        sections.append(f"## Communication Style\n{training_data['tone_guidelines']}")

    if "spanish_guidelines" in training_data:
        sections.append(f"## Spanish Response Guidelines\n{training_data['spanish_guidelines']}")

    base = training_data.get(
        "system_base",
        "You are DoGoods AI Assistant, a warm and helpful community food sharing assistant.",
    )
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # Hard rule: when the user asks the assistant to *do* something, the
    # assistant must call the matching tool instead of describing how the
    # user could do it themselves. Several user reports traced back to the
    # model replying with instructions ("go to the listing and tap Claim")
    # instead of calling claim_listing / post_food_listing / cancel_claim.
    action_policy = (
        "## Action-Taking Policy (CRITICAL)\n"
        "You are an AGENT, not a help article. When the user asks you to do "
        "something the platform supports, you MUST call the corresponding tool "
        "and report the result. Do NOT respond with step-by-step instructions "
        "telling the user to do it themselves.\n"
        "- 'claim X for me' / 'I want that one' / 'reserve it' -> call claim_listing\n"
        "- 'I got the code 1234' / 'confirm 1234' -> call confirm_claim\n"
        "- 'cancel my claim' / 'release it' -> call cancel_claim\n"
        "- 'post a listing for X' / 'donate Y' -> call post_food_listing\n"
        "- 'I need food' / 'request X' -> call post_food_request\n"
        "- 'update my address/phone/diet' -> call update_user_profile\n"
        "Only ask a clarifying question if a REQUIRED parameter is genuinely "
        "missing (e.g. you don't know which listing they mean). Otherwise, "
        "call the tool first, then summarize what happened."
    )
    return (
        f"{base}\n\nCurrent date and time: {now_str}\n\n"
        + action_policy
        + "\n\n"
        + "\n\n".join(sections)
    )


# ---------------------------------------------------------------------------
# Role-specific behaviour
# ---------------------------------------------------------------------------

_ROLE_BEHAVIOR_EN: dict[str, str] = {
    "recipient": (
        "The user is a RECIPIENT. Proactively suggest food items they can claim — "
        "use search_food_near_user and get_user_dashboard. Respect their allergies "
        "and dietary_restrictions. Nudge them to set reminders for pickup windows."
    ),
    "donor": (
        "The user is a DONOR. Focus on their posted listings. If any are close to "
        "expiring, warn them (call get_donor_expiring_listings) and suggest lowering "
        "price, highlighting, or re-sharing. Celebrate completed donations."
    ),
    "volunteer": (
        "The user is a VOLUNTEER. Help with pickup logistics — call "
        "get_driver_route_plan for an optimised stop order and get_mapbox_route for "
        "directions. Encourage safe driving and on-time arrivals."
    ),
    "driver": (
        "The user is a DRIVER. Prioritise route optimisation (get_driver_route_plan) "
        "and next-stop ETA. Surface pickup deadlines. Keep directions concise."
    ),
    "dispatcher": (
        "The user is a DISPATCHER. Help them triage by calling get_dispatch_queue; "
        "match open requests to unclaimed listings, flag urgency, and recommend "
        "volunteer assignments. Be operational and concise."
    ),
    "admin": (
        "The user is an ADMIN. Use get_platform_stats when they ask about health, "
        "activity, or outcomes. Offer encouraging, positive framing ('great growth "
        "this week!') and flag real anomalies. Never expose raw user PII unasked."
    ),
}

_ROLE_BEHAVIOR_ES: dict[str, str] = {
    "recipient": (
        "El usuario es RECIPIENTE. Sugiere alimentos que pueda reclamar (usa "
        "search_food_near_user y get_user_dashboard). Respeta alergias y "
        "restricciones dietéticas. Recuérdale configurar alertas de recogida."
    ),
    "donor": (
        "El usuario es DONANTE. Enfócate en sus publicaciones activas. Si alguna está "
        "por vencer, avísale (get_donor_expiring_listings) y sugiere acciones. "
        "Felicítalo por donaciones completadas."
    ),
    "volunteer": (
        "El usuario es VOLUNTARIO. Ayúdalo con la logística de recogidas: "
        "get_driver_route_plan y get_mapbox_route. Recomienda manejar con seguridad."
    ),
    "driver": (
        "El usuario es CONDUCTOR. Prioriza rutas optimizadas (get_driver_route_plan) "
        "y tiempos estimados a la siguiente parada."
    ),
    "dispatcher": (
        "El usuario es DESPACHADOR. Apóyalo con get_dispatch_queue, empareja "
        "solicitudes con listados disponibles y señala urgencias."
    ),
    "admin": (
        "El usuario es ADMIN. Usa get_platform_stats al preguntar por la salud de la "
        "plataforma. Usa tono alentador y positivo. No expongas datos personales sin pedirlo."
    ),
}


def _role_behavior_prompt(role: Optional[str], lang: str = "en") -> Optional[str]:
    if not role:
        return None
    key = str(role).lower().strip()
    mapping = _ROLE_BEHAVIOR_ES if lang == "es" else _ROLE_BEHAVIOR_EN
    return mapping.get(key)


async def _profile_gap_prompt(user_id: int, lang: str = "en") -> Optional[str]:
    """Inject a nudge telling the model about missing profile fields."""
    try:
        from backend.ai.tools import _get_profile_gaps  # type: ignore
    except Exception:
        return None
    try:
        result = await _get_profile_gaps(str(user_id))
    except Exception:
        return None
    if not isinstance(result, dict) or result.get("error"):
        return None
    prompts = result.get("prompts_es" if lang == "es" else "prompts_en") or []
    if not prompts:
        return None
    header_en = (
        "Profile gaps detected for this user. When it feels natural in the "
        "conversation, politely invite them (max 1 short sentence) to share ONE of "
        "the following so you can help better. Do NOT list all gaps at once."
    )
    header_es = (
        "Perfil incompleto. Cuando sea natural en la conversación, invítale "
        "amablemente (máx. 1 oración) a compartir UNA de las siguientes cosas. "
        "No enumeres todas a la vez."
    )
    header = header_es if lang == "es" else header_en
    bullets = "\n".join(f"- {p}" for p in prompts)
    return f"{header}\n{bullets}"


# ---------------------------------------------------------------------------
# Privacy guard for run_safe_query
# ---------------------------------------------------------------------------

# Each entity that the run_safe_query whitelist exposes is mapped to the
# column that identifies the owning/participating user, plus an optional
# role-based "is this the caller?" test. The AI is forced to filter on
# the authenticated user for any of these entities so one user can never
# enumerate another user's listings, requests, or profile data.
_SAFE_QUERY_USER_SCOPE = {
    # donor_id OR recipient_id must equal auth user
    "listings": ("donor_id", "recipient_id"),
    # recipient_id must equal auth user
    "requests": ("recipient_id",),
    # id must equal auth user (no enumerating the users table)
    "users": ("id",),
}


def _scope_safe_query(fn_args: dict, auth_user_id: int) -> dict:
    """Ensure run_safe_query is always scoped to the authenticated user.

    If the caller (an LLM) does not already include a filter binding the
    query to its own user_id via one of the accepted columns, we inject
    an ``eq`` filter so the result cannot span other accounts. Centers are
    public directory data and are left unchanged.
    """
    if not isinstance(fn_args, dict):
        return {"entity": "centers"}
    entity = str(fn_args.get("entity") or "").lower()
    accepted_cols = _SAFE_QUERY_USER_SCOPE.get(entity)
    if not accepted_cols:
        # Centers (or unknown entity — handler will reject) — no scoping.
        return fn_args

    filters = fn_args.get("filters") or []
    if not isinstance(filters, list):
        filters = []

    def _binds_to_auth(f: dict) -> bool:
        if not isinstance(f, dict):
            return False
        field = str(f.get("field", ""))
        op = str(f.get("op", "eq")).lower()
        val = f.get("value")
        if field not in accepted_cols or op != "eq":
            return False
        try:
            return int(str(val)) == int(auth_user_id)
        except (TypeError, ValueError):
            return False

    # Drop any filter on one of the scope columns that targets a *different*
    # user, then append our own eq-filter if none already binds us.
    cleaned = [
        f for f in filters
        if not (isinstance(f, dict)
                and str(f.get("field", "")) in accepted_cols
                and not _binds_to_auth(f))
    ]
    if not any(_binds_to_auth(f) for f in cleaned):
        cleaned.append({
            "field": accepted_cols[0],
            "op": "eq",
            "value": int(auth_user_id),
        })

    new_args = dict(fn_args)
    new_args["filters"] = cleaned
    return new_args


# ---------------------------------------------------------------------------
# Conversation Engine
# ---------------------------------------------------------------------------

class ConversationEngine:
    """MySQL-backed conversation engine."""

    def __init__(self) -> None:
        self.training_data = _load_training_data()
        from backend.ai.tools import TOOL_DEFINITIONS, execute_tool
        self.tool_definitions = TOOL_DEFINITIONS
        self._execute_tool = execute_tool

    @property
    def system_prompt(self) -> str:
        return _build_system_prompt(self.training_data)

    def _detect_lang(self, text: str) -> str:
        return "es" if detect_spanish(text) else "en"

    # ---- Profile lookup via SQLAlchemy ------------------------------------

    async def get_user_profile(self, user_id: int) -> Optional[dict]:
        from backend.app import SessionLocal
        from backend.models import User

        def _sync() -> Optional[dict]:
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return None
                return {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role.value if user.role else None,
                    "organization": None,
                    "is_admin": user.role and user.role.value == "admin",
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "lat": user.coords_lat,
                    "lng": user.coords_lng,
                    "phone": user.phone,
                }
            finally:
                db.close()

        return await asyncio.get_event_loop().run_in_executor(None, _sync)

    # ---- History via SQLAlchemy -------------------------------------------

    async def get_conversation_history(self, user_id: int, limit: int = 50) -> list[dict]:
        from backend.app import SessionLocal
        from backend.ai.models import AIConversation

        def _sync() -> list[dict]:
            db = SessionLocal()
            try:
                rows = (
                    db.query(AIConversation)
                    .filter(AIConversation.user_id == user_id)
                    .order_by(AIConversation.created_at.desc())
                    .limit(limit)
                    .all()
                )
                rows.reverse()
                return [
                    {
                        "role": r.role,
                        "message": r.message,
                        "created_at": r.created_at.isoformat() if r.created_at else "",
                    }
                    for r in rows
                ]
            finally:
                db.close()

        return await asyncio.get_event_loop().run_in_executor(None, _sync)

    async def store_message(
        self,
        user_id: int,
        role: str,
        message: str,
        metadata: dict | None = None,
    ) -> Optional[int]:
        from backend.app import SessionLocal
        from backend.ai.models import AIConversation

        def _sync() -> Optional[int]:
            db = SessionLocal()
            try:
                row = AIConversation(
                    user_id=user_id,
                    role=role,
                    message=message,
                    meta=json.dumps(metadata) if metadata else None,
                )
                db.add(row)
                db.commit()
                db.refresh(row)
                return row.id
            except Exception as exc:
                logger.error("store_message failed: %s", exc)
                db.rollback()
                return None
            finally:
                db.close()

        return await asyncio.get_event_loop().run_in_executor(None, _sync)

    async def clear_history(self, user_id: int) -> int:
        from backend.app import SessionLocal
        from backend.ai.models import AIConversation

        def _sync() -> int:
            db = SessionLocal()
            try:
                n = db.query(AIConversation).filter(AIConversation.user_id == user_id).delete()
                db.commit()
                return n
            except Exception as exc:
                logger.error("clear_history failed: %s", exc)
                db.rollback()
                return 0
            finally:
                db.close()

        return await asyncio.get_event_loop().run_in_executor(None, _sync)

    # ---- Main chat --------------------------------------------------------

    async def chat(
        self,
        user_id: int,
        message: str,
        include_audio: bool = False,
    ) -> dict:
        lang = self._detect_lang(message)

        profile_task = asyncio.create_task(self.get_user_profile(user_id))
        history_task = asyncio.create_task(self.get_conversation_history(user_id, limit=4))
        profile, history = await asyncio.gather(profile_task, history_task)

        messages: list[dict] = [{"role": "system", "content": self.system_prompt}]

        if lang == "es":
            messages.append({
                "role": "system",
                "content": (
                    "The user is writing in Spanish. You MUST respond entirely in Spanish. "
                    "Maintain a warm, helpful personality."
                ),
            })

        if profile:
            context = (
                f"Current user: {profile.get('name', 'Community Member')} "
                f"(ID: {user_id}). Role: {profile.get('role') or 'member'}. "
                f"When calling tools that require user_id, always use \"{user_id}\"."
            )
        else:
            context = (
                f"Current user ID: {user_id}. "
                f"When calling tools that require user_id, always use \"{user_id}\"."
            )
        messages.append({"role": "system", "content": context})

        # Action policy: let the AI actually DO things on the user's behalf.
        # Only injected when the user's message looks actionable — saves tokens
        # and avoids encouraging tool narration when tools are disabled.
        if self._needs_tools(message):
            action_policy_en = (
                "You can take actions for the user through tool calls. Use the ACTION "
                "tools (claim_listing, cancel_claim, update_user_profile, post_food_request, "
                "post_food_listing, send_user_message) whenever the user asks — you do not "
                "need to ask them to click buttons. "
                "Rules: "
                "(1) The server enforces the authenticated user_id; still pass the id shown above. "
                "(2) For destructive / irreversible actions (cancel_claim, post_food_listing, "
                "post_food_request), confirm briefly once before calling. "
                "(3) For small updates (e.g. adding an allergy, opting into SMS), act immediately and report what changed. "
                "(4) When the user says things like 'I'll take it', 'reserve that', 'grab #42', "
                "call claim_listing. Then tell them to watch for the SMS code. "
                "(5) If a tool returns an error, explain it plainly and suggest the next step."
            )
            action_policy_es = (
                "Puedes realizar acciones por el usuario mediante tool calls. Usa las herramientas "
                "de ACCIÓN (claim_listing, cancel_claim, update_user_profile, post_food_request, "
                "post_food_listing, send_user_message) cuando el usuario lo pida — no le digas que "
                "haga clic en botones. Reglas: (1) El servidor impone el user_id autenticado. "
                "(2) Confirma brevemente antes de acciones destructivas. (3) Para cambios pequeños, "
                "actúa de inmediato y reporta el resultado. (4) Frases como 'lo tomo', 'resérvalo' "
                "deben disparar claim_listing. (5) Si una herramienta falla, explícalo y sugiere el siguiente paso."
            )
            messages.append({
                "role": "system",
                "content": action_policy_es if lang == "es" else action_policy_en,
            })

        # Role-specific behaviour + profile-gap nudges (best-effort; non-fatal)
        try:
            role_prompt = _role_behavior_prompt(
                (profile or {}).get("role"), lang=lang
            )
            if role_prompt:
                messages.append({"role": "system", "content": role_prompt})
        except Exception as exc:  # pragma: no cover
            logger.debug("role prompt build failed: %s", exc)

        try:
            gap_prompt = await _profile_gap_prompt(user_id, lang=lang)
            if gap_prompt:
                messages.append({"role": "system", "content": gap_prompt})
        except Exception as exc:  # pragma: no cover
            logger.debug("profile gap prompt failed: %s", exc)

        for msg in history:
            content = msg["message"]
            if len(content) > 400:
                content = content[:400] + "... [truncated]"
            messages.append({"role": msg["role"], "content": content})

        messages.append({"role": "user", "content": message})

        response_text = await self._call_with_fallbacks(messages, lang, auth_user_id=user_id)

        conversation_id = await self._persist_conversation(
            user_id, message, response_text, lang
        )

        audio_b64 = None
        if include_audio:
            audio_b64 = await self._generate_audio_b64(response_text, lang=lang)

        return {
            "text": response_text,
            "audio_url": audio_b64,  # data URL, or None
            "user_id": str(user_id),
            "lang": lang,
            "conversation_id": str(conversation_id) if conversation_id else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def _persist_conversation(
        self, user_id: int, user_msg: str, assistant_msg: str, lang: str
    ) -> Optional[int]:
        try:
            _, row_id = await asyncio.gather(
                self.store_message(user_id, "user", user_msg),
                self.store_message(
                    user_id, "assistant", assistant_msg, metadata={"lang": lang}
                ),
            )
            return row_id
        except Exception as exc:
            logger.error("Persistence failed: %s", exc)
            return None

    # ---- GPT call with fallback ------------------------------------------

    async def _call_with_fallbacks(self, messages: list[dict], lang: str = "en", auth_user_id: Optional[int] = None) -> str:
        try:
            return await self._call_openai_chat(messages, lang=lang, auth_user_id=auth_user_id)
        except httpx.TimeoutException:
            return get_canned_response("timeout", lang)
        except httpx.HTTPStatusError:
            return get_canned_response("api_down", lang)
        except RuntimeError as exc:
            logger.error("GPT runtime error: %s", exc)
            return get_canned_response("api_down", lang)
        except Exception as exc:
            logger.error("GPT unexpected error: %s", exc)
            return get_canned_response("general_error", lang)

    async def public_chat_reply(self, messages: list[dict], lang: str = "en") -> str:
        """Stateless OpenAI call with NO tools and NO persistence.

        Used by the anonymous landing-page chat. Safe to expose without auth.
        """
        if not OPENAI_API_KEY:
            return get_canned_response("api_down", lang)
        payload = {
            "model": CHAT_MODEL,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 600,
        }
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        try:
            resp = await _openai_with_retry(
                "POST",
                f"{OPENAI_BASE_URL}/chat/completions",
                headers=headers,
                json_payload=payload,
            )
            data = resp.json()
            return data["choices"][0]["message"].get("content", "").strip() or get_canned_response("general_error", lang)
        except httpx.TimeoutException:
            return get_canned_response("timeout", lang)
        except httpx.HTTPStatusError:
            return get_canned_response("api_down", lang)
        except Exception as exc:
            logger.error("public_chat_reply error: %s", exc)
            return get_canned_response("general_error", lang)

    @staticmethod
    def _needs_tools(message: str) -> bool:
        lower = message.lower()
        tool_keywords = {
            "dashboard", "profile", "my account", "my info",
            "pickup", "schedule", "claim", "claimed",
            "remind", "reminder", "set a reminder",
            "near me", "nearby", "find food", "available food",
            "search food", "food near", "listings near",
            "direction", "directions", "route", "routes",
            "distribution", "community", "communities", "center",
            "my listings", "my food",
            # role-specific
            "expiring", "expire", "expiry", "about to expire",
            "queue", "dispatch", "assignment", "assign", "unassigned",
            "stats", "metrics", "platform", "how are we doing",
            "complete my profile", "fill my profile", "profile gap",
            "dietary", "allergies", "preferences",
            # voice / GPS / routing / query
            "current location", "here", "my location", "gps",
            "urgent", "urgency", "most urgent",
            "optimize", "optimise", "best route", "plan route",
            "recipe", "recipes", "cook", "meal",
            "how many", "how much", "query", "list all", "show me",
            # actions (write)
            "reserve", "take it", "grab it", "i'll take",
            "cancel", "release", "unclaim", "drop",
            "update my", "change my", "set my", "save my",
            "add allergy", "add allergies", "add dietary",
            "opt in", "opt out", "sms", "text me",
            "post a request", "request food", "ask for",
            "post a listing", "list my", "donate", "share food", "give away",
            "send message", "tell admin", "tell donor", "message them",
        }
        return any(kw in lower for kw in tool_keywords)

    # Tools that write on behalf of the user — user_id MUST come from the
    # authenticated session, never from the model's arguments.
    _ACTION_TOOLS = {
        "claim_listing",
        "cancel_claim",
        "update_user_profile",
        "post_food_request",
        "post_food_listing",
        "send_user_message",
        "create_ai_reminder",
        "create_reminder",
    }

    async def _call_openai_chat(self, messages: list[dict], lang: str = "en", auth_user_id: Optional[int] = None) -> str:
        if not OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY not configured")

        user_text = ""
        for m in reversed(messages):
            if m["role"] == "user":
                user_text = m.get("content", "")
                break
        use_tools = self._needs_tools(user_text)

        payload = {
            "model": CHAT_MODEL,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
        }
        if use_tools:
            payload["tools"] = self.tool_definitions

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        resp = await _openai_with_retry(
            "POST",
            f"{OPENAI_BASE_URL}/chat/completions",
            headers=headers,
            json_payload=payload,
        )
        data = resp.json()
        choice = data["choices"][0]
        msg = choice["message"]

        # Single-round tool calling
        if msg.get("tool_calls"):
            tool_messages = list(messages)
            tool_messages.append(msg)
            for tool_call in msg["tool_calls"]:
                fn_name = tool_call["function"]["name"]
                try:
                    fn_args = json.loads(tool_call["function"]["arguments"])
                except (json.JSONDecodeError, TypeError) as parse_err:
                    tool_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps({"error": f"Invalid arguments: {parse_err}"}),
                    })
                    continue
                # Security: the AI must never operate on another user's
                # behalf. Whenever a tool call carries a `user_id` argument,
                # force it to the authenticated user so prompt-injection
                # (or a hallucinated id) cannot pivot to another account.
                # This covers BOTH read tools (profile, dashboard, history,
                # pickups) and write tools (claim, cancel, update, post).
                if not isinstance(fn_args, dict):
                    fn_args = {}
                if auth_user_id is not None and "user_id" in fn_args:
                    fn_args["user_id"] = str(auth_user_id)
                # run_safe_query: force a caller-scoped filter on any entity
                # that has a user column, so the model can't enumerate other
                # users' listings/requests or read the users table freely.
                if fn_name == "run_safe_query" and auth_user_id is not None:
                    fn_args = _scope_safe_query(fn_args, auth_user_id)
                try:
                    result = await self._execute_tool(fn_name, fn_args)
                except Exception as tool_exc:
                    logger.error("Tool %s failed: %s", fn_name, tool_exc)
                    result = {"error": True, "message": f"{fn_name} failed: {tool_exc}"}

                result_str = json.dumps(result, default=str)
                if len(result_str) > 4000:
                    result_str = result_str[:4000] + "...[truncated]"
                tool_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": result_str,
                })

            followup_payload = {
                "model": FOLLOWUP_MODEL,
                "messages": tool_messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            }
            try:
                resp = await _openai_with_retry(
                    "POST",
                    f"{OPENAI_BASE_URL}/chat/completions",
                    headers=headers,
                    json_payload=followup_payload,
                )
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as followup_exc:
                logger.error("Follow-up failed: %s", followup_exc)
                return get_canned_response("tool_error", lang)

        return msg["content"]

    # ---- Whisper + TTS ---------------------------------------------------

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        if not OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY not configured")
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        resp = await _openai_with_retry(
            "POST",
            f"{OPENAI_BASE_URL}/audio/transcriptions",
            headers=headers,
            files={"file": (filename, audio_bytes)},
            data={"model": WHISPER_MODEL, "response_format": "json"},
            timeout=60,
        )
        return resp.json()["text"]

    async def generate_speech(self, text: str, lang: str = "en") -> bytes:
        if not OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY not configured")
        truncated = text[:4096]
        voice = TTS_VOICE_ES if lang == "es" else TTS_VOICE_EN
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        resp = await _openai_with_retry(
            "POST",
            f"{OPENAI_BASE_URL}/audio/speech",
            headers=headers,
            json_payload={"model": TTS_MODEL, "input": truncated, "voice": voice},
            timeout=30,
        )
        return resp.content

    async def _generate_audio_b64(self, text: str, lang: str = "en") -> Optional[str]:
        """Return the TTS audio as a base64 data URL (no external storage needed)."""
        try:
            audio_bytes = await self.generate_speech(text, lang=lang)
            import base64
            b64 = base64.b64encode(audio_bytes).decode("ascii")
            return f"data:audio/mpeg;base64,{b64}"
        except Exception as exc:
            logger.warning("Audio generation failed: %s", exc)
            return None


conversation_engine = ConversationEngine()
