"""
FoodMaps AI Conversation Engine — MySQL edition.

Ported from the Supabase version. Talks to:
  - OpenAI GPT-4.1 (reasoning + tool calls)
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
from backend.aws_secrets import load_aws_secrets
from dotenv import load_dotenv

# Load .env from project root
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_aws_secrets()
load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_engine")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = "https://api.openai.com/v1"
# Chat / tool-calling: gpt-4.1 has stronger reasoning and more reliable
# tool-calling than gpt-4o, with the same JSON-schema function-calling
# API. Override via AI_CHAT_MODEL if you want a different model.
CHAT_MODEL = os.getenv("AI_CHAT_MODEL", "gpt-4.1")
# Follow-up summary after tool execution doesn't need full-size model;
# gpt-4.1-mini is a good cost/quality balance.
FOLLOWUP_MODEL = os.getenv("AI_FOLLOWUP_MODEL", "gpt-4.1-mini")
WHISPER_MODEL = os.getenv("AI_WHISPER_MODEL", "whisper-1")
TTS_MODEL = os.getenv("AI_TTS_MODEL", "tts-1")
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
        "You are the FoodMaps AI Assistant, a warm and helpful community food sharing assistant for the FoodMaps platform. Always refer to the product as FoodMaps.",
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
        "call the tool first, then summarize what happened.\n"
        "\n"
        "### NO-STALL RULE (ZERO TOLERANCE)\n"
        "NEVER reply with placeholder/stall text like 'one moment please', "
        "'I'll do that for you', 'let me check', 'hang on' WITHOUT also "
        "emitting a tool_call in the SAME response. If you announce an "
        "action, the tool_call MUST accompany the announcement — the user "
        "will not send another message to 'unblock' you. Either:\n"
        "  (a) call the tool now (preferred), or\n"
        "  (b) ask the single specific clarifying question you need.\n"
        "Stalling without a tool_call is a critical failure.\n"
        "\n"
        "### LISTING ID RESOLUTION\n"
        "When the user picks a listing by name (e.g. 'claim the kale', "
        "'I want the Fresh Organic Kale'), find the matching listing in "
        "the most recent search_food_near_user / list_available_listings "
        "result you have in this conversation, and pass its numeric id as "
        "claim_listing's listing_id. If you do not yet have a listing list "
        "in context, call search_food_near_user FIRST (in the same turn) "
        "to fetch candidates — do not ask the user for the id.\n"
        "\n"
        "### ALWAYS PRESENT OPTIONS BEFORE CLAIMING (CRITICAL)\n"
        "Whenever the user expresses interest in food without naming a "
        "specific listing — e.g. 'I'm hungry', 'find me food', 'what's "
        "available?', 'I need produce', 'claim something for me', 'any "
        "bread nearby?', 'I want to eat' — you MUST:\n"
        "  1. Call search_food_near_user FIRST (do not claim anything yet).\n"
        "  2. In your reply, list the available options as a NUMBERED list. "
        "For each item include: the title, distance (if available), and a "
        "short detail (quantity, expiration, or category). Keep it to the "
        "top 3-5 closest results so the user can scan quickly.\n"
        "  3. End with a clear question like 'Which one would you like to "
        "claim? Reply with the number or the name.'\n"
        "  4. ONLY after the user picks one, call claim_listing with the "
        "matching listing_id resolved from the list you just showed.\n"
        "Never claim a listing on the user's behalf without first showing "
        "them the options and getting an explicit pick. The single exception "
        "is when the user already names or numbers a specific listing in "
        "their current message AND that listing is in your most recent "
        "search result — then you may claim directly.\n"
        "Example response format:\n"
        "  Here are the closest options near you:\n"
        "  1. Fresh Organic Kale — 0.4 mi, 2 bunches, expires tomorrow\n"
        "  2. Sourdough Loaves — 0.7 mi, 3 loaves, baked today\n"
        "  3. Mixed Berries — 1.1 mi, 1 pint, expires in 2 days\n"
        "  Which one would you like to claim? Reply with the number or name.\n"
        "\n"
        "### CONVERSATIONAL CLAIM FLOW (CRITICAL — TONE)\n"
        "Claiming should feel like texting a friend, not filing a ticket. "
        "Use the same one-question-at-a-time, warm-acknowledgement rhythm "
        "as the donor flow. ONE short question per turn. Mirror what the "
        "user said. Use defaults from their profile when sensible.\n"
        "\n"
        "Reference dialog (the model MUST emulate this rhythm):\n"
        "  Recipient: 'I'm hungry, what's nearby?'\n"
        "  AI:        <calls search_food_near_user, then>\n"
        "             'Here's what's close to you right now:\n"
        "              1. Sourdough Loaves — 0.4 mi, 3 loaves, baked today\n"
        "              2. Fresh Kale — 0.7 mi, 2 bunches, expires tomorrow\n"
        "              3. Mixed Berries — 1.1 mi, 1 pint\n"
        "              Which one sounds good?'\n"
        "  Recipient: 'the bread'\n"
        "  AI:        'Nice choice — how many loaves do you want? They have 3.'\n"
        "  Recipient: '2'\n"
        "  AI:        'Got it, 2 loaves. Picking them up yourself, or "
        "want to schedule a delivery?'\n"
        "  Recipient: 'pickup'\n"
        "  AI:        'Perfect. Want me to lock it in now? I'll send you "
        "a 4-digit code to show at pickup.'\n"
        "  Recipient: 'yes'\n"
        "  AI:        <calls claim_listing(listing_id=...), then>\n"
        "             'Done! I claimed the Sourdough Loaves for you. Your "
        "pickup code is 4729 — show it to the donor when you arrive at "
        "379 S Pole St. You have 5 minutes to confirm before it auto-"
        "releases. Want directions?'\n"
        "  Recipient: 'I got the code 4729'\n"
        "  AI:        <calls confirm_claim>\n"
        "             'Pickup confirmed! Enjoy the bread 🍞'\n"
        "\n"
        "Hard rules for this flow:\n"
        "  1. ONE QUESTION PER TURN once the options are on screen. Don't "
        "ask 'how many AND pickup or delivery AND when' all at once.\n"
        "  2. ACKNOWLEDGE the recipient's pick warmly ('Nice choice', "
        "'Good pick', 'Perfect') before asking the next thing.\n"
        "  3. INFER QUANTITY DEFAULT — if the listing has only 1 unit "
        "available, skip the qty question. Otherwise ask how many they "
        "want, but understand that claim_listing claims the whole listing "
        "(no partial-claim API today). If the recipient wants fewer than "
        "are listed, just acknowledge that and proceed; the donor will "
        "hand them the right amount at pickup.\n"
        "  4. CONFIRM BEFORE LOCKING — for non-trivial claims, ask 'Want "
        "me to lock it in?' before calling claim_listing, so the user "
        "isn't surprised by the 5-minute timer. Exception: if the user "
        "said 'claim it' / 'reserve it' / 'I'll take it' explicitly, "
        "skip the confirmation and claim immediately.\n"
        "  5. AFTER CLAIMING, follow the ANNOUNCE CLAIM SUCCESS rules "
        "below — lead with the confirmation, share the code (inline if "
        "SMS failed), mention the 5-minute window, then offer a helpful "
        "next step ('Want directions?', 'Need the donor's number?').\n"
        "  6. CANCEL FLOW — if the user says 'cancel' / 'never mind' / "
        "'release it', acknowledge ('No problem, releasing it now…'), "
        "call cancel_claim, then confirm ('Released — it's back up for "
        "someone else.').\n"
        "  7. NEVER ask about technical fields (listing_id numbers, "
        "claim status enums). The recipient should never see an id.\n"
        "\n"
        "### ANNOUNCE CLAIM SUCCESS (CRITICAL)\n"
        "After claim_listing returns successfully, your reply MUST clearly "
        "tell the user the food has been claimed. Do not be vague. Always:\n"
        "  1. Lead with an explicit confirmation sentence using the word "
        "'claimed' and the listing's title — e.g. 'Done! I claimed the "
        "Fresh Organic Kale for you.' or 'You\\u2019ve successfully claimed "
        "the Sourdough Loaves.'\n"
        "  2. Then tell them the next step: a 4-digit confirmation code was "
        "sent by SMS (or, if the tool result includes confirm_code because "
        "sms_delivered is false, show that code inline and tell them to "
        "reply with it to confirm pickup).\n"
        "  3. Mention the 5-minute auto-release window so they know to "
        "confirm soon.\n"
        "After confirm_claim returns successfully, lead with 'Pickup "
        "confirmed!' (or equivalent) and the listing title, and remind them "
        "where/when to pick up if you have that info.\n"
        "Never reply only with a question or only with next-step instructions "
        "after a successful claim — the user must hear that the claim worked.\n"
        "\n"
        "### NEVER FAKE SUCCESS — VERIFY BEFORE CONFIRMING (CRITICAL)\n"
        "You may only tell the user an action succeeded if the corresponding "
        "tool call returned a success payload in this same turn. Concretely:\n"
        "  - post_food_listing: success means the tool result has "
        "`success: true` AND a numeric `listing_id`. If the result has an "
        "`error` field, the listing was NOT posted — relay the error to the "
        "user verbatim (e.g. missing address, invalid category, expired "
        "date) and ask for the missing info. NEVER say 'I posted your "
        "listing' without that listing_id.\n"
        "  - post_food_request: same rule. Only claim it was posted when "
        "you have a request_id from the tool.\n"
        "  - claim_listing / confirm_claim / cancel_claim / "
        "update_user_profile: identical — confirm only when the tool result "
        "is success-shaped, otherwise relay the error.\n"
        "If you did not call the matching tool at all this turn, you have "
        "NOT done the action — do not pretend you did. Either call the tool "
        "now, or ask one specific clarifying question. Hallucinating "
        "success ('posted!', 'done!', 'all set!') without a verified tool "
        "result is the worst possible failure mode and erodes user trust.\n"
        "\n"
        "### ANNOUNCE LISTING POST SUCCESS\n"
        "After post_food_listing returns success, lead with 'Posted!' (or "
        "'Your listing is up!') and include the listing title and the "
        "listing_id. Briefly mention what happens next (recipients can "
        "claim it; you'll be notified). After post_food_request returns "
        "success, lead with 'Request posted!' and the request id.\n"
        "\n"
        "### CONVERSATIONAL DATA GATHERING (CRITICAL — TONE)\n"
        "You are a chat assistant, NOT a form. When a user wants to "
        "share/donate/post food (or post a request), DO NOT interrogate "
        "them field-by-field like a spreadsheet. Talk like a friendly "
        "neighbor helping them out.\n"
        "\n"
        "### ONE-AT-A-TIME CONVERSATIONAL FLOW (CRITICAL)\n"
        "When a user wants to donate/share food, follow this exact step-by-"
        "step rhythm. ONE short question per turn. Mirror what they said in "
        "your acknowledgement. Use defaults from their profile when sensible. "
        "Do NOT show a numbered list of fields. Do NOT dump every required "
        "field at once. Do NOT use a table.\n"
        "\n"
        "Reference dialog (the model MUST emulate this rhythm and warmth):\n"
        "  Donor: 'I have some bread to donate'\n"
        "  AI:    'That's great! How many do you have?'\n"
        "  Donor: '3'\n"
        "  AI:    'Perfect — are they for pickup or drop-off?'\n"
        "  Donor: 'pickup'\n"
        "  AI:    'Great — what address should recipients come to, or "
        "should I use your current location?'\n"
        "  Donor: 'use my current location'\n"
        "  AI:    'Got it — I'll use 379 S Pole St, Alameda CA 67890. "
        "Is that correct?'\n"
        "  Donor: 'yes'\n"
        "  AI:    'Awesome. Can you take or upload a photo of the bread?'\n"
        "  Donor: <uploads photo, the chat injects an image_url>\n"
        "  AI:    'Beautiful! Just a couple more things and I'll get you "
        "all set up. What's the expiration date?'\n"
        "  Donor: 'July 7th'\n"
        "  AI:    'Perfect, that's all I needed. Anything else you want "
        "to add — allergens, dietary notes, special pickup hours?'\n"
        "  Donor: 'no'\n"
        "  AI:    <calls post_food_listing with everything gathered, "
        "including images=[the_url], then announces 'Posted! Your 3 "
        "loaves of sourdough bread are live, listing #42. Recipients "
        "nearby will see it and can claim it.'>\n"
        "\n"
        "Hard rules for this flow:\n"
        "  1. EXACTLY ONE QUESTION PER TURN. Wait for the donor's reply.\n"
        "  2. ALWAYS ACKNOWLEDGE the donor's last message warmly before "
        "moving on ('Got it', 'Perfect', 'Awesome', 'Sounds good').\n"
        "  3. ASK ABOUT THE PHOTO: include 'Can you take or upload a "
        "photo?' as a step. If the donor's most recent message contains "
        "an image URL or data URL, treat that as the photo and don't "
        "re-ask. The frontend will paste 'image: <url>' into the chat "
        "when the donor uploads.\n"
        "  4. CONFIRM ADDRESS by reading it back: 'I'll use <address>. "
        "Is that correct?' rather than just assuming.\n"
        "  5. END WITH AN OPEN INVITATION ('anything else you want to "
        "add?') so the donor can mention allergens / dietary notes / "
        "special pickup hours WITHOUT being asked field-by-field.\n"
        "  6. ONLY THEN call post_food_listing with everything gathered. "
        "Pass image URLs as the `images` array.\n"
        "  7. NEVER ask about technical fields (perishability level, "
        "category enum, ISO date format). Infer those silently.\n"
        "  8. SAME PATTERN for post_food_request, update_user_profile, "
        "and other action tools — one short question per turn, warm "
        "acknowledgements, infer defaults.\n"
        "\n"
        "### BULK UPLOAD (CSV / PDF)\n"
        "If the donor uploads or pastes a CSV (or a PDF that has been "
        "converted to text by the frontend) describing many items, do "
        "NOT walk through each row one at a time. Call "
        "bulk_import_listings with the csv_text and report a summary "
        "('Posted 12 of 14 listings — 2 rows had missing addresses, "
        "want me to fix them?'). The frontend will paste the CSV into "
        "the chat as a fenced code block; treat any incoming message "
        "starting with 'csv:' or wrapped in ```csv ... ``` as bulk "
        "import intent and call bulk_import_listings directly.\n"
        "\n"
        "Other rules of thumb still apply:\n"
        "  • PARSE FREE TEXT FIRST. If the donor writes a full sentence "
        "with multiple facts ('I have 3 sourdough loaves at 379 S Pole "
        "St, pickup after 5pm'), extract everything in one shot — don't "
        "re-ask things they already told you. Then ask only the next "
        "missing piece (e.g. 'Got it — can you upload a photo?').\n"
        "  • INFER SENSIBLE DEFAULTS. Most fields are OPTIONAL. The "
        "server fills smart defaults for pickup_window (next 48h), "
        "expiration_date (perishability-based), unit ('units'), "
        "perishability ('medium'), and category (guessed from title). "
        "If the donor doesn't volunteer them, don't ask.\n"
        "  • TRULY-REQUIRED fields are: title, qty, and an address (the "
        "donor's profile address counts).\n"
        "  • TONE: warm, brief, neighborly. Use contractions. Vary "
        "phrasing across turns. Avoid corporate language ('please "
        "provide', 'kindly specify', 'in order to proceed')."
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

        response_text, actions = await self._call_with_fallbacks(messages, lang, auth_user_id=user_id)

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
            "actions": actions,
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

    async def _call_with_fallbacks(self, messages: list[dict], lang: str = "en", auth_user_id: Optional[int] = None) -> tuple[str, list[dict]]:
        actions: list[dict] = []
        try:
            text = await self._call_openai_chat(messages, lang=lang, auth_user_id=auth_user_id, actions_out=actions)
            return text, actions
        except httpx.TimeoutException:
            return get_canned_response("timeout", lang), actions
        except httpx.HTTPStatusError:
            return get_canned_response("api_down", lang), actions
        except RuntimeError as exc:
            logger.error("GPT runtime error: %s", exc)
            return get_canned_response("api_down", lang), actions
        except Exception as exc:
            logger.error("GPT unexpected error: %s", exc)
            return get_canned_response("general_error", lang), actions

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

    async def _call_openai_chat(self, messages: list[dict], lang: str = "en", auth_user_id: Optional[int] = None, actions_out: Optional[list] = None) -> str:
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

                # Trace tool calls so we can debug why the model picked a tool.
                try:
                    logger.info(
                        "AI tool call: %s args=%s ok=%s",
                        fn_name,
                        {k: v for k, v in fn_args.items() if k != "user_id"},
                        not (isinstance(result, dict) and result.get("error")),
                    )
                except Exception:
                    pass

                # Record this tool call so the UI can surface progress /
                # done indicators (claiming, listing posted, etc.).
                if actions_out is not None and isinstance(result, dict):
                    err_val = result.get("error")
                    ok = not err_val
                    # Suppress noisy "✗ Claim failed" chips when the model
                    # hallucinates a listing the user never asked for. The
                    # backend returned an error and the chat reply itself
                    # already explains it; an additional red chip just
                    # confuses the user.
                    suppress_chip = (
                        not ok
                        and fn_name in {"claim_listing", "confirm_claim", "cancel_claim"}
                        and isinstance(err_val, str)
                        and (
                            "not found" in err_val.lower()
                            or "invalid" in err_val.lower()
                            or "no listing_id" in err_val.lower()
                        )
                    )
                    if not suppress_chip:
                        summary_val = result.get("summary")
                        if not summary_val and err_val:
                            summary_val = err_val if isinstance(err_val, str) else None
                        entry = {
                            "tool": fn_name,
                            "ok": bool(ok),
                            "summary": summary_val,
                            "listing_id": result.get("listing_id"),
                        }
                        # Forward extra UI-control fields (navigate_ui / show_map)
                        # so the frontend can act on them without another roundtrip.
                        for extra_key in ("action", "target", "view", "focus"):
                            if extra_key in result and result[extra_key] is not None:
                                entry[extra_key] = result[extra_key]
                        actions_out.append(entry)

                result_str = json.dumps(result, default=str)
                if len(result_str) > 4000:
                    # For bulk operations, the per-row `results` array can be
                    # huge. Drop it and keep the summary so the AI can still
                    # report success/failure counts without blowing the
                    # context window. For other tools, fall back to a hard
                    # truncate.
                    if isinstance(result, dict) and isinstance(result.get("results"), list):
                        trimmed = {k: v for k, v in result.items() if k != "results"}
                        trimmed["results_omitted"] = len(result["results"])
                        result_str = json.dumps(trimmed, default=str)
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
