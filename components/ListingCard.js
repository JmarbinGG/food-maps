function ListingCard({ listing, onClaim, onSelect, user }) {
  // Check if this listing is claimed by the current user
  const isClaimedByMe = React.useMemo(() => {
    if (!user) return false;
    const userId = String(user.id);
    
    // Check recipient_id
    const recipientId = listing.recipient_id ?? listing.recipientId ?? listing.recipient?.id;
    if (recipientId && String(recipientId) === userId) return true;
    
    // Check localStorage fallback
    try {
      const key = `my_claimed_ids:${userId}`;
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(arr) && arr.includes(String(listing.id));
    } catch (_) {
      return false;
    }
  }, [listing, user]);

  // Check if listing is in a claimed state
  const listingStatus = String(listing.status || '').toLowerCase();
  const isClaimed = listingStatus === 'claimed' || listingStatus === 'pending_confirmation';
  
  // Display user-friendly status
  const displayStatus = listingStatus === 'pending_confirmation' ? 'claimed' : listingStatus;

  return (
    <div className="card mb-4 cursor-pointer" onClick={() => onSelect(listing)}>
      <h4 className="font-semibold">{listing.title}</h4>
      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm">{listing.qty} {listing.unit}</span>
        <div className="flex gap-2 items-center">
          {isClaimedByMe && isClaimed && user?.role === 'recipient' && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Claimed
            </span>
          )}
          <span className={`status-${displayStatus}`}>{displayStatus}</span>
        </div>
      </div>
      {listingStatus === 'available' && !isClaimedByMe && user?.role === 'recipient' && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClaim(listing.id); }}
          className="btn-primary w-full mt-2"
        >
          Claim
        </button>
      )}
    </div>
  );
}