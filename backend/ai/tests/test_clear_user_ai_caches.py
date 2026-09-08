"""Clearing chat history must wipe per-user AI in-memory caches."""
from backend.ai.conversation_flow import (
    clear_user_ai_caches,
    get_assistance_session,
    get_claim_drafts,
    get_last_bulk_posted_ids,
    get_last_search_listings,
    get_share_drafts,
    set_assistance_session,
    set_claim_drafts,
    set_last_bulk_posted_ids,
    set_last_search_listings,
    set_share_drafts,
)


def test_clear_user_ai_caches_wipes_all_session_state():
    uid = "clear-cache-user"
    set_assistance_session(uid, mode="guided", goal="share")
    set_share_drafts(uid, [{"title": "apples", "qty": 5}])
    set_claim_drafts(uid, [{"listing_id": "lid-1", "qty": 1}])
    set_last_search_listings(uid, [{"id": "lid-1", "title": "bread"}])
    set_last_bulk_posted_ids(uid, ["lid-a", "lid-b"])

    clear_user_ai_caches(uid)

    assert get_assistance_session(uid) is None
    assert get_share_drafts(uid) == []
    assert get_claim_drafts(uid) == []
    assert get_last_search_listings(uid) == []
    assert get_last_bulk_posted_ids(uid) == []


def test_clear_user_ai_caches_normalizes_numeric_aliases():
    set_assistance_session("018", mode="hands_on", goal="find")
    set_last_search_listings("018", [{"id": "x", "title": "milk"}])
    set_claim_drafts("18", [{"listing_id": "x", "qty": 2}])

    clear_user_ai_caches("18")

    assert get_assistance_session("018") is None
    assert get_last_search_listings("018") == []
    assert get_claim_drafts("18") == []
    assert get_claim_drafts("018") == []
