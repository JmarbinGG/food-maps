"""
DoGoods AI tools — MySQL edition.

OpenAI function-calling tool definitions and handlers.
All data operations go through SQLAlchemy against the main MySQL database.
"""
from __future__ import annotations


import asyncio
import json
import logging
import math
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

logger = logging.getLogger("ai_tools")

MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN") or os.getenv("VITE_MAPBOX_TOKEN", "")
MAPBOX_DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox"


# ---------------------------------------------------------------------------
# OpenAI function-calling tool schemas
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_food_near_user",
            "description": "Search available food listings near a user's saved location within a radius.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "radius_km": {"type": "number", "default": 10},
                    "food_type": {"type": "string", "description": "Optional category: produce, prepared, packaged, bakery, water, fruit, leftovers"},
                    "max_results": {"type": "integer", "default": 10},
                },
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": "Retrieve a user's profile, dietary info, and activity summary.",
            "parameters": {
                "type": "object",
                "properties": {"user_id": {"type": "string"}},
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pickup_schedule",
            "description": "Get upcoming pickups (claimed food) and distribution center events for a user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "include_community_events": {"type": "boolean", "default": True},
                    "days_ahead": {"type": "integer", "default": 7},
                },
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_reminder",
            "description": "Schedule a reminder (pickup, expiry, event, or general) for a user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "message": {"type": "string"},
                    "trigger_time": {"type": "string", "description": "ISO 8601 datetime"},
                    "reminder_type": {
                        "type": "string",
                        "enum": ["pickup", "listing_expiry", "distribution_event", "general"],
                        "default": "general",
                    },
                    "related_id": {"type": "integer"},
                },
                "required": ["user_id", "message", "trigger_time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_mapbox_route",
            "description": "Get driving/walking/cycling directions between two points.",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin_lng": {"type": "number"},
                    "origin_lat": {"type": "number"},
                    "dest_lng": {"type": "number"},
                    "dest_lat": {"type": "number"},
                    "profile": {"type": "string", "enum": ["driving", "walking", "cycling"], "default": "driving"},
                },
                "required": ["origin_lng", "origin_lat", "dest_lng", "dest_lat"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_distribution_centers",
            "description": "List active distribution centers (community food hubs).",
            "parameters": {
                "type": "object",
                "properties": {
                    "max_results": {"type": "integer", "default": 10},
                    "user_id": {"type": "string", "description": "Optional: sort by proximity"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_dashboard",
            "description": "Rich dashboard: profile, active listings, claimed food, reminders, impact.",
            "parameters": {
                "type": "object",
                "properties": {"user_id": {"type": "string"}},
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_pickup_schedule",
            "description": "Check pending reminders and scheduled pickups, organized by type.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "include_sent": {"type": "boolean", "default": False},
                    "days_ahead": {"type": "integer", "default": 14},
                },
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_recipes",
            "description": "Suggest recipes from given ingredients or a user's claimed food.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ingredients": {"type": "array", "items": {"type": "string"}},
                    "user_id": {"type": "string"},
                    "dietary_preferences": {"type": "string"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_storage_tips",
            "description": "Storage/preservation tips for specific food items or a user's claimed food.",
            "parameters": {
                "type": "object",
                "properties": {
                    "food_items": {"type": "array", "items": {"type": "string"}},
                    "user_id": {"type": "string"},
                },
                "required": [],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

async def execute_tool(name: str, arguments: dict) -> dict:
    handlers = {
        "search_food_near_user": _search_food_near_user,
        "get_user_profile": _get_user_profile,
        "get_pickup_schedule": _get_pickup_schedule,
        "create_reminder": _create_reminder,
        "get_mapbox_route": _get_mapbox_route,
        "query_distribution_centers": _query_distribution_centers,
        "get_user_dashboard": _get_user_dashboard,
        "check_pickup_schedule": _check_pickup_schedule,
        "get_recipes": _get_recipes,
        "get_storage_tips": _get_storage_tips,
    }
    handler = handlers.get(name)
    if handler is None:
        return {"error": f"Unknown tool: {name}"}
    try:
        return await handler(**arguments)
    except Exception as exc:
        logger.error("Tool %s failed: %s", name, exc)
        return {"error": f"Tool execution failed: {exc}"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _to_int(value) -> Optional[int]:
    try:
        return int(str(value))
    except (ValueError, TypeError):
        return None


async def _run(sync_fn):
    """Run a blocking SQLAlchemy function in a thread."""
    return await asyncio.get_event_loop().run_in_executor(None, sync_fn)


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

async def _search_food_near_user(
    user_id: str,
    radius_km: float = 10,
    food_type: Optional[str] = None,
    max_results: int = 10,
) -> dict:
    from backend.app import SessionLocal
    from backend.models import User, FoodResource, FoodCategory

    uid = _to_int(user_id)
    if uid is None:
        return {"error": "Invalid user_id"}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == uid).first()
            if not user:
                return {"results": [], "total": 0, "error": "User not found"}

            user_lat, user_lng = user.coords_lat, user.coords_lng

            q = db.query(FoodResource).filter(FoodResource.status == "available")
            if food_type:
                try:
                    cat = FoodCategory(food_type.lower())
                    q = q.filter(FoodResource.category == cat)
                except ValueError:
                    pass

            listings = q.order_by(FoodResource.created_at.desc()).limit(200).all()

            results = []
            for l in listings:
                lat, lng = l.coords_lat, l.coords_lng
                dist = None
                if lat is not None and lng is not None and user_lat is not None and user_lng is not None:
                    dist = _haversine(user_lat, user_lng, float(lat), float(lng))
                    if dist > radius_km:
                        continue
                results.append({
                    "id": l.id,
                    "title": l.title,
                    "description": (l.description or "")[:200],
                    "category": l.category.value if l.category else None,
                    "quantity": l.qty,
                    "unit": l.unit,
                    "address": l.address,
                    "expiry_date": l.expiration_date.isoformat() if l.expiration_date else None,
                    "pickup_by": l.pickup_window_end.isoformat() if l.pickup_window_end else None,
                    "distance_km": round(dist, 1) if dist is not None else None,
                    "latitude": lat,
                    "longitude": lng,
                })

            results.sort(key=lambda r: r["distance_km"] if r["distance_km"] is not None else 9999)
            results = results[:max_results]

            if results:
                parts = []
                for i, r in enumerate(results, 1):
                    d = f"{r['distance_km']} km away" if r["distance_km"] is not None else "nearby"
                    parts.append(
                        f"{i}. **{r['title']}** ({r['category'] or 'food'}) — "
                        f"{r['quantity']} {r['unit'] or 'items'}, {d}. Pickup: {r['address']}."
                    )
                summary = f"Found {len(results)} food item(s) near you:\n" + "\n".join(parts)
            else:
                summary = "No available food listings found in your area right now."

            return {
                "results": results,
                "total": len(results),
                "radius_km": radius_km,
                "user_location_available": user_lat is not None,
                "summary": summary,
            }
        finally:
            db.close()

    return await _run(_sync)


async def _get_user_profile(user_id: str) -> dict:
    from backend.app import SessionLocal
    from backend.models import User, FoodResource

    uid = _to_int(user_id)
    if uid is None:
        return {"error": "Invalid user_id"}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == uid).first()
            if not user:
                return {"user_id": user_id, "profile": None, "message": "User not found"}

            listings_count = db.query(FoodResource).filter(FoodResource.donor_id == uid).count()
            claims_count = db.query(FoodResource).filter(FoodResource.recipient_id == uid).count()

            try:
                diet = json.loads(user.dietary_restrictions) if user.dietary_restrictions else []
            except (ValueError, TypeError):
                diet = []
            try:
                allergies = json.loads(user.allergies) if user.allergies else []
            except (ValueError, TypeError):
                allergies = []

            return {
                "user_id": user_id,
                "profile": {
                    "name": user.name,
                    "email": user.email,
                    "role": user.role.value if user.role else None,
                    "phone": user.phone,
                    "address": user.address,
                    "trust_score": user.trust_score,
                    "email_verified": user.email_verified,
                    "phone_verified": user.phone_verified,
                    "dietary_restrictions": diet,
                    "allergies": allergies,
                    "household_size": user.household_size,
                    "member_since": user.created_at.isoformat() if user.created_at else None,
                },
                "activity": {
                    "listings_shared": listings_count,
                    "food_claimed": claims_count,
                    "completed_exchanges": user.completed_exchanges or 0,
                },
            }
        finally:
            db.close()

    return await _run(_sync)


async def _get_pickup_schedule(
    user_id: str,
    include_community_events: bool = True,
    days_ahead: int = 7,
) -> dict:
    from backend.app import SessionLocal
    from backend.models import FoodResource, DistributionCenter

    uid = _to_int(user_id)
    if uid is None:
        return {"error": "Invalid user_id"}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            claimed = (
                db.query(FoodResource)
                .filter(FoodResource.recipient_id == uid)
                .filter(FoodResource.status.in_(["claimed", "pending", "approved"]))
                .order_by(FoodResource.pickup_window_start.asc())
                .limit(20)
                .all()
            )
            pickups = [
                {
                    "claim_id": l.id,
                    "food_title": l.title,
                    "status": l.status,
                    "pickup_date": l.pickup_window_start.isoformat() if l.pickup_window_start else None,
                    "pickup_by": l.pickup_window_end.isoformat() if l.pickup_window_end else None,
                    "address": l.address,
                }
                for l in claimed
            ]

            events = []
            if include_community_events:
                centers = (
                    db.query(DistributionCenter)
                    .filter(DistributionCenter.is_active == True)  # noqa: E712
                    .limit(10)
                    .all()
                )
                for c in centers:
                    events.append({
                        "center_id": c.id,
                        "name": c.name,
                        "description": (c.description or "")[:200],
                        "address": c.address,
                        "phone": c.phone,
                        "hours": c.hours,
                    })

            return {"pickups": pickups, "events": events, "days_ahead": days_ahead}
        finally:
            db.close()

    return await _run(_sync)


async def _create_reminder(
    user_id: str,
    message: str,
    trigger_time: str,
    reminder_type: str = "general",
    related_id: Optional[int] = None,
) -> dict:
    from backend.app import SessionLocal
    from backend.ai.models import AIReminder

    uid = _to_int(user_id)
    if uid is None:
        return {"created": False, "error": "Invalid user_id"}

    try:
        trigger_dt = datetime.fromisoformat(trigger_time.replace("Z", "+00:00"))
        if trigger_dt < datetime.now(timezone.utc):
            return {"created": False, "error": "Trigger time must be in the future."}
    except (ValueError, TypeError):
        return {"created": False, "error": "Invalid trigger_time format (use ISO 8601)."}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            # Store as naive UTC for MySQL DATETIME
            row = AIReminder(
                user_id=uid,
                message=message,
                trigger_time=trigger_dt.astimezone(timezone.utc).replace(tzinfo=None),
                reminder_type=reminder_type,
                related_id=related_id,
                sent=False,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            return {
                "created": True,
                "reminder_id": row.id,
                "trigger_time": trigger_time,
                "message": f"Reminder set for {trigger_time}.",
            }
        except Exception as exc:
            db.rollback()
            return {"created": False, "error": str(exc)}
        finally:
            db.close()

    return await _run(_sync)


async def _get_mapbox_route(
    origin_lng: float,
    origin_lat: float,
    dest_lng: float,
    dest_lat: float,
    profile: str = "driving",
) -> dict:
    if not MAPBOX_TOKEN:
        return {
            "error": "Mapbox token not configured",
            "fallback": f"Straight-line distance: ~{_haversine(origin_lat, origin_lng, dest_lat, dest_lng):.1f} km.",
        }

    if profile not in ("driving", "walking", "cycling"):
        profile = "driving"

    coords = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    url = f"{MAPBOX_DIRECTIONS_URL}/{profile}/{coords}"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params={
                "access_token": MAPBOX_TOKEN,
                "geometries": "geojson",
                "overview": "simplified",
                "steps": "true",
                "language": "en",
            })
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        return {"error": f"Mapbox API error: HTTP {exc.response.status_code}"}
    except Exception as exc:
        return {"error": f"Mapbox request failed: {exc}"}

    routes = data.get("routes", [])
    if not routes:
        return {"error": "No route found"}

    route = routes[0]
    duration_sec = route.get("duration", 0)
    distance_m = route.get("distance", 0)
    steps = []
    for leg in route.get("legs", []):
        for step in leg.get("steps", []):
            instr = step.get("maneuver", {}).get("instruction", "")
            if instr:
                steps.append({
                    "instruction": instr,
                    "distance_m": round(step.get("distance", 0)),
                    "duration_sec": round(step.get("duration", 0)),
                })

    dist_km = distance_m / 1000
    if duration_sec < 60:
        time_str = f"{int(duration_sec)} seconds"
    elif duration_sec < 3600:
        time_str = f"{int(duration_sec // 60)} minutes"
    else:
        h = int(duration_sec // 3600)
        m = int((duration_sec % 3600) // 60)
        time_str = f"{h}h {m}min"

    return {
        "profile": profile,
        "distance_km": round(dist_km, 2),
        "duration_minutes": round(duration_sec / 60, 1),
        "duration_text": time_str,
        "steps": steps[:20],
        "summary": f"Route by {profile}: {dist_km:.1f} km, about {time_str}.",
    }


async def _query_distribution_centers(
    max_results: int = 10,
    user_id: Optional[str] = None,
) -> dict:
    from backend.app import SessionLocal
    from backend.models import DistributionCenter, User

    def _sync() -> dict:
        db = SessionLocal()
        try:
            user_lat = user_lng = None
            if user_id:
                uid = _to_int(user_id)
                if uid is not None:
                    u = db.query(User).filter(User.id == uid).first()
                    if u:
                        user_lat, user_lng = u.coords_lat, u.coords_lng

            centers = (
                db.query(DistributionCenter)
                .filter(DistributionCenter.is_active == True)  # noqa: E712
                .limit(50)
                .all()
            )
            results = []
            for c in centers:
                entry = {
                    "center_id": c.id,
                    "name": c.name,
                    "description": (c.description or "")[:300],
                    "address": c.address,
                    "phone": c.phone,
                    "hours": c.hours,
                    "verified_by_aglf": c.verified_by_aglf,
                    "school_partner": c.school_partner,
                }
                if (
                    user_lat is not None and user_lng is not None
                    and c.coords_lat is not None and c.coords_lng is not None
                ):
                    dist = _haversine(user_lat, user_lng, c.coords_lat, c.coords_lng)
                    entry["distance_km"] = round(dist, 1)
                results.append(entry)

            if user_lat is not None:
                results.sort(key=lambda r: r.get("distance_km", 9999))
            else:
                results.sort(key=lambda r: r["name"] or "")

            results = results[:max_results]
            if results:
                parts = [
                    f"{i}. **{r['name']}** — {r.get('address', 'N/A')}"
                    + (f" ({r['distance_km']} km away)" if 'distance_km' in r else "")
                    for i, r in enumerate(results, 1)
                ]
                summary = f"Found {len(results)} distribution center(s):\n" + "\n".join(parts)
            else:
                summary = "No active distribution centers found."

            return {"centers": results, "total": len(results), "summary": summary}
        finally:
            db.close()

    return await _run(_sync)


async def _get_user_dashboard(user_id: str) -> dict:
    from backend.app import SessionLocal
    from backend.models import User, FoodResource
    from backend.ai.models import AIReminder

    uid = _to_int(user_id)
    if uid is None:
        return {"error": "Invalid user_id"}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == uid).first()
            if not user:
                return {"user_id": user_id, "error": "User not found"}

            active_listings = (
                db.query(FoodResource)
                .filter(FoodResource.donor_id == uid, FoodResource.status == "available")
                .order_by(FoodResource.created_at.desc())
                .limit(5)
                .all()
            )
            pending_claims = (
                db.query(FoodResource)
                .filter(FoodResource.recipient_id == uid)
                .filter(FoodResource.status.in_(["claimed", "pending", "approved"]))
                .order_by(FoodResource.created_at.desc())
                .limit(5)
                .all()
            )
            now = datetime.utcnow()
            upcoming_reminders = (
                db.query(AIReminder)
                .filter(AIReminder.user_id == uid)
                .filter(AIReminder.sent == False)  # noqa: E712
                .filter(AIReminder.trigger_time >= now)
                .order_by(AIReminder.trigger_time.asc())
                .limit(5)
                .all()
            )
            completed_shared = (
                db.query(FoodResource)
                .filter(FoodResource.donor_id == uid, FoodResource.status == "claimed")
                .count()
            )
            completed_received = (
                db.query(FoodResource)
                .filter(FoodResource.recipient_id == uid, FoodResource.status == "claimed")
                .count()
            )

            return {
                "user_id": user_id,
                "profile": {
                    "name": user.name,
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role.value if user.role else None,
                    "is_admin": user.role and user.role.value == "admin",
                    "trust_score": user.trust_score,
                    "member_since": user.created_at.isoformat() if user.created_at else None,
                },
                "active_listings": [
                    {"title": l.title, "category": l.category.value if l.category else None,
                     "quantity": l.qty, "status": l.status}
                    for l in active_listings
                ],
                "pending_claims": [
                    {"food_title": l.title, "status": l.status,
                     "pickup_date": l.pickup_window_start.isoformat() if l.pickup_window_start else None}
                    for l in pending_claims
                ],
                "upcoming_reminders": [
                    {"message": r.message, "trigger_time": r.trigger_time.isoformat(),
                     "type": r.reminder_type}
                    for r in upcoming_reminders
                ],
                "impact_summary": {
                    "food_shared_count": completed_shared,
                    "food_received_count": completed_received,
                    "total_contributions": completed_shared + completed_received,
                },
            }
        finally:
            db.close()

    return await _run(_sync)


async def _check_pickup_schedule(
    user_id: str,
    include_sent: bool = False,
    days_ahead: int = 14,
) -> dict:
    from backend.app import SessionLocal
    from backend.models import FoodResource
    from backend.ai.models import AIReminder

    uid = _to_int(user_id)
    if uid is None:
        return {"error": "Invalid user_id"}

    def _sync() -> dict:
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            future = now + timedelta(days=days_ahead)

            reminders_q = (
                db.query(AIReminder)
                .filter(AIReminder.user_id == uid)
                .filter(AIReminder.trigger_time <= future)
            )
            if not include_sent:
                reminders_q = reminders_q.filter(AIReminder.sent == False)  # noqa: E712
            reminders = reminders_q.order_by(AIReminder.trigger_time.asc()).limit(50).all()

            reminders_by_type: dict[str, list] = {
                "pickup": [], "listing_expiry": [], "distribution_event": [], "general": [],
            }
            for r in reminders:
                t = r.reminder_type if r.reminder_type in reminders_by_type else "general"
                reminders_by_type[t].append({
                    "id": r.id, "message": r.message,
                    "trigger_time": r.trigger_time.isoformat(),
                    "sent": r.sent,
                })

            claimed = (
                db.query(FoodResource)
                .filter(FoodResource.recipient_id == uid)
                .filter(FoodResource.status.in_(["claimed", "pending", "approved"]))
                .order_by(FoodResource.pickup_window_start.asc())
                .limit(20)
                .all()
            )
            pickups = [
                {
                    "claim_id": l.id,
                    "food_title": l.title,
                    "status": l.status,
                    "pickup_date": l.pickup_window_start.isoformat() if l.pickup_window_start else None,
                    "pickup_by": l.pickup_window_end.isoformat() if l.pickup_window_end else None,
                    "address": l.address,
                    "expiry_date": l.expiration_date.isoformat() if l.expiration_date else None,
                }
                for l in claimed
            ]

            total_reminders = sum(len(v) for v in reminders_by_type.values())
            parts = []
            if pickups:
                parts.append(f"{len(pickups)} pending pickup(s)")
            for kind in ("pickup", "distribution_event", "listing_expiry", "general"):
                if reminders_by_type[kind]:
                    parts.append(f"{len(reminders_by_type[kind])} {kind.replace('_', ' ')} reminder(s)")

            summary = "Your schedule: " + ", ".join(parts) + "." if parts else "You have no pending pickups or reminders."

            return {
                "pickups": pickups,
                "reminders": reminders_by_type,
                "total_reminders": total_reminders,
                "total_pickups": len(pickups),
                "summary": summary,
            }
        finally:
            db.close()

    return await _run(_sync)


async def _get_recipes(
    ingredients: Optional[list[str]] = None,
    user_id: Optional[str] = None,
    dietary_preferences: Optional[str] = None,
) -> dict:
    from backend.ai.ai_engine import legacy_ai_request, _extract_content, CHAT_MODEL
    from backend.app import SessionLocal
    from backend.models import FoodResource

    # Pull user's claimed food if no ingredients supplied
    if not ingredients and user_id:
        uid = _to_int(user_id)
        if uid is not None:
            def _fetch():
                db = SessionLocal()
                try:
                    rows = (
                        db.query(FoodResource)
                        .filter(FoodResource.recipient_id == uid)
                        .filter(FoodResource.status.in_(["claimed", "approved", "pending"]))
                        .limit(10)
                        .all()
                    )
                    return [r.title for r in rows if r.title]
                finally:
                    db.close()
            ingredients = await _run(_fetch)

    diet_note = f" The recipes must be {dietary_preferences}." if dietary_preferences else ""

    if not ingredients:
        prompt = (
            "Suggest 3 easy, budget-friendly recipes using common pantry staples."
            f"{diet_note} For each: name, ingredients with quantities, steps, "
            "prep time, cook time, servings. Return JSON array."
        )
    else:
        prompt = (
            f"Suggest 3 creative recipes using some or all of these ingredients: "
            f"{', '.join(ingredients)}.{diet_note} For each: name, ingredients with "
            "quantities, steps, prep time, cook time, servings. Return JSON array."
        )

    payload = {
        "model": CHAT_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful culinary assistant for a food-sharing community."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.8,
        "max_tokens": 1500,
    }
    try:
        data = await legacy_ai_request("/chat/completions", payload)
        return {
            "recipes": _extract_content(data),
            "ingredients_used": ingredients or ["common pantry staples"],
            "dietary_preferences": dietary_preferences,
        }
    except Exception as exc:
        return {"error": f"Failed to generate recipes: {exc}"}


async def _get_storage_tips(
    food_items: Optional[list[str]] = None,
    user_id: Optional[str] = None,
) -> dict:
    from backend.ai.ai_engine import legacy_ai_request, _extract_content, CHAT_MODEL
    from backend.app import SessionLocal
    from backend.models import FoodResource

    if not food_items and user_id:
        uid = _to_int(user_id)
        if uid is not None:
            def _fetch():
                db = SessionLocal()
                try:
                    rows = (
                        db.query(FoodResource)
                        .filter(FoodResource.recipient_id == uid)
                        .filter(FoodResource.status.in_(["claimed", "approved", "pending"]))
                        .limit(10)
                        .all()
                    )
                    return [r.title for r in rows if r.title]
                finally:
                    db.close()
            food_items = await _run(_fetch)

    if not food_items:
        return {"error": "No food items provided and no claimed food found for user."}

    prompt = (
        f"Provide storage tips for: {', '.join(food_items)}. "
        "For each item include optimal temperature, container, shelf life "
        "(fridge/freezer/pantry), spoilage signs, and tips to extend freshness. "
        "Return JSON."
    )
    payload = {
        "model": CHAT_MODEL,
        "messages": [
            {"role": "system", "content": "You are a food preservation expert."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.5,
        "max_tokens": 1500,
    }
    try:
        data = await legacy_ai_request("/chat/completions", payload)
        return {"tips": _extract_content(data), "food_items": food_items}
    except Exception as exc:
        return {"error": f"Failed to generate storage tips: {exc}"}
