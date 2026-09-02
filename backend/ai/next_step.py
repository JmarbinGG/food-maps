"""Deterministic next-step chip recommendations after tool actions."""
from __future__ import annotations

from typing import Any, Optional

_NEXT_STEP_CLAIM_TOOLS = {"claim_food_listing", "claim_listing", "claim_food"}
_NEXT_STEP_POST_TOOLS = {
    "post_food_listing", "create_food_listing",
    "bulk_post_food_listings", "bulk_import_listings",
}
_NEXT_STEP_SEARCH_TOOLS = {
    "search_food_listings", "search_food_near_user",
    "find_food", "get_recent_listings",
}
_NEXT_STEP_SEARCH_THRESHOLD = 10


def compute_next_step(
    actions: Optional[list[dict[str, Any]]],
    lang: str = "en",
) -> Optional[dict[str, str]]:
    """Return a {label, prompt} chip from the last successful tool in the trace."""
    if not actions:
        return None

    es = (lang or "en").lower().startswith("es")

    for entry in reversed(actions):
        if not isinstance(entry, dict) or not entry.get("ok"):
            continue
        tool = entry.get("tool") or ""
        raw_result = entry.get("result")
        result: dict[str, Any] = raw_result if isinstance(raw_result, dict) else {}
        if not result:
            result = {
                k: entry[k]
                for k in (
                    "listings", "results", "total", "count", "image_url",
                    "photo_url", "has_photo", "listing", "listing_id",
                )
                if k in entry and entry[k] is not None
            }

        if tool in _NEXT_STEP_CLAIM_TOOLS:
            return {
                "label": "\U0001f449 Revisar detalles de recogida" if es
                         else "\U0001f449 Review pickup details",
                "prompt": "Mu\u00e9strame los detalles de recogida" if es
                          else "Show me the pickup details",
            }

        if tool in _NEXT_STEP_POST_TOOLS:
            raw_listing = result.get("listing")
            listing: dict[str, Any] = raw_listing if isinstance(raw_listing, dict) else {}
            has_photo = bool(
                result.get("image_url")
                or result.get("photo_url")
                or result.get("has_photo")
                or listing.get("image_url")
                or listing.get("has_photo")
                or entry.get("image_url")
            )
            if not has_photo:
                return {
                    "label": "\U0001f449 Agregar una foto para m\u00e1s visibilidad" if es
                             else "\U0001f449 Add a photo to increase visibility",
                    "prompt": "Agregar una foto a mi publicaci\u00f3n" if es
                              else "Add a photo to my listing",
                }

        if tool in _NEXT_STEP_SEARCH_TOOLS:
            results = (
                result.get("results")
                or result.get("listings")
                or entry.get("listings")
                or []
            )
            total = result.get("total", entry.get("total"))
            count_field = result.get("count", entry.get("count"))
            if isinstance(total, int) and total > 0:
                count = total
            elif isinstance(count_field, int) and count_field > 0:
                count = count_field
            elif isinstance(results, list):
                count = len(results)
            else:
                count = 0
            if count > _NEXT_STEP_SEARCH_THRESHOLD:
                return {
                    "label": "\U0001f449 Filtrar por distancia o preferencia diet\u00e9tica" if es
                             else "\U0001f449 Narrow by distance or dietary preference",
                    "prompt": "Filtrar por distancia o preferencia diet\u00e9tica" if es
                              else "Narrow by distance or dietary preference",
                }

    return None
