export function browseCommunityIdsForUser(user, { isAdmin } = {}) {
  if (isAdmin) return null;
  if (user?.community_id != null) return [String(user.community_id)];
  return null;
}

export function listingVisibleToCommunityScope(listing, allowedIds) {
  if (!allowedIds) return true;
  const cid = listing?.community_id;
  if (cid == null) return true;
  return allowedIds.includes(String(cid));
}
