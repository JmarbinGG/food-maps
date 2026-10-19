"""Shared role guards for AI tool calls (chat, bulk, agent paths)."""
from __future__ import annotations

from typing import Any, Optional

POST_TOOLS = frozenset({
    "post_food_listing",
    "post_food_listings",
    "bulk_import_listings",
    "attach_photos_to_listing",
})

CLAIM_TOOLS = frozenset({
    "claim_listing",
    "claim_listings",
    "claim_food",
    "confirm_claim",
})

POST_BLOCKED_ROLES = frozenset({"recipient", "volunteer", "driver", "dispatcher"})

CLAIM_BLOCKED_ROLES = frozenset({
    "donor",
    "admin",
    "organizer",
    "dispatcher",
    "driver",
    "volunteer",
})


class RoleLookupError(RuntimeError):
    """The user's role could not be determined (profile lookup failed)."""


async def _lookup_role_strict(uid: str) -> str:
    from backend.ai.tools import _get_user_profile
    try:
        raw = await _get_user_profile(uid)
    except Exception as exc:
        raise RoleLookupError(f"profile lookup failed for user {uid}") from exc
    if not raw or raw.get("error"):
        raise RoleLookupError(f"no profile for user {uid}")
    return _role_from_profile(raw)


async def resolve_user_community_role(user_id: str) -> str:
    """Best-effort role for prompt/context use; falls back to "member"."""
    uid = str(user_id or "").strip()
    if not uid:
        return "member"
    try:
        return await _lookup_role_strict(uid)
    except RoleLookupError:
        return "member"


def _role_from_profile(raw: dict) -> str:
    nested = raw.get("profile")
    if isinstance(nested, dict):
        role = nested.get("community_role") or nested.get("role")
    else:
        role = raw.get("role") or raw.get("community_role")
    return str(role or "member").lower().strip() or "member"


async def check_role_allows_tool(
    user_id: str,
    tool_name: str,
    *,
    role_hint: Optional[str] = None,
) -> Optional[dict[str, Any]]:
    name = str(tool_name or "").strip()
    uid = str(user_id or "").strip()
    if not uid or not name:
        return None
    if role_hint:
        role = role_hint.lower().strip()
    elif name in POST_TOOLS or name in CLAIM_TOOLS:
        # Fail closed: an unknown role must not pass as an allowed one.
        # Callers turn RoleLookupError into a "try again" response.
        role = await _lookup_role_strict(uid)
    else:
        return None
    if name in POST_TOOLS and role in POST_BLOCKED_ROLES:
        if role == "recipient":
            msg = (
                "This account is a recipient account and cannot donate or post "
                "food listings. Please sign in as a donor to share food."
            )
        else:
            msg = (
                f"This account is a {role} account and cannot post food listings. "
                "Sign in as a donor to share food, or ask Nouri for logistics help."
            )
        return {
            "error": msg,
            "reason": "wrong_role",
            "current_role": role,
            "required_role": "donor",
        }
    if name in CLAIM_TOOLS and role in CLAIM_BLOCKED_ROLES:
        if role == "donor":
            msg = (
                "This account is a donor account and cannot claim food. "
                "Please sign in as a recipient to claim listings."
            )
        else:
            msg = (
                f"This account is a {role} account and cannot claim food. "
                "Sign in as a recipient to claim listings."
            )
        return {
            "error": msg,
            "reason": "wrong_role",
            "current_role": role,
            "required_role": "recipient",
        }
    return None


def claiming_role_block_message(role: str, *, lang: str = "en") -> Optional[str]:
    key = str(role or "").lower().strip()
    if key not in CLAIM_BLOCKED_ROLES:
        return None
    if lang == "es":
        if key == "donor":
            return (
                "La cuenta es de donante — no puede reclamar comida. "
                "NO llames a claim_listing. Explica en una oracion que debe "
                "iniciar sesion como recipiente."
            )
        return (
            f"La cuenta es de {key} — no puede reclamar comida. "
            "NO llames a claim_listing este turno."
        )
    if key == "donor":
        return (
            "This account is a donor account — it cannot claim food. "
            "Do NOT call claim_listing. Explain in one sentence they should "
            "sign in as a recipient."
        )
    return (
        f"This account is a {key} account — it cannot claim food. "
        "Do NOT call claim_listing this turn."
    )
