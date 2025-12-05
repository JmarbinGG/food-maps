function ListingCard({ listing, onClaim, onSelect, user }) {
  const [contactInfo, setContactInfo] = React.useState(null);
  const [loadingContact, setLoadingContact] = React.useState(false);

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
  const getDisplayStatus = () => {
    if (listingStatus === 'pending_confirmation') return 'Pending Confirmation';
    return listingStatus.charAt(0).toUpperCase() + listingStatus.slice(1);
  };
  const displayStatus = getDisplayStatus();

  // Check if user should see contact info (only after confirmation)
  const shouldShowContact = React.useMemo(() => {
    if (!user || listingStatus !== 'claimed') return false;
    const userId = String(user.id);
    const donorId = String(listing.donor_id || listing.donorId || (listing.donor && listing.donor.id) || '');
    
    // Check if this user claimed the listing (via localStorage)
    const isClaimedByMe = (() => {
      try {
        const key = `my_claimed_ids:${userId}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(arr) && arr.includes(String(listing.id));
      } catch (_) {
        return false;
      }
    })();
    
    // Donor can see recipient contact (if user is the donor)
    // Recipient can see donor contact (if user claimed it)
    return (user.role === 'donor' && donorId === userId) || 
           (user.role === 'recipient' && isClaimedByMe);
  }, [user, listing, listingStatus]);

  // Fetch contact info when needed
  React.useEffect(() => {
    if (shouldShowContact && !contactInfo && !loadingContact) {
      setLoadingContact(true);
      fetch(`/api/listings/user-details/${listing.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || `API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.name || data.phone) {
          setContactInfo(data);
        } else {
          setContactInfo({ error: 'Contact information not available' });
        }
      })
      .catch(err => {
        console.error('Failed to fetch contact info:', err);
        setContactInfo({ error: err.message || 'Failed to load contact' });
      })
      .finally(() => setLoadingContact(false));
    }
  }, [shouldShowContact, listing.id, contactInfo, loadingContact]);

  return (
    <div className="card mb-4 cursor-pointer" onClick={() => onSelect(listing)}>
      <h4 className="font-semibold">{listing.title}</h4>
      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm">{listing.qty} {listing.unit}</span>
        <div className="flex gap-2 items-center">
          <span className={`status-${listingStatus}`}>{displayStatus}</span>
        </div>
      </div>
      
      {/* Pending Confirmation Notice for recipient */}
      {listingStatus === 'pending_confirmation' && isClaimedByMe && user?.role === 'recipient' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">Waiting for Confirmation</p>
              <p className="text-xs text-yellow-800 mt-1">Click here to enter your code</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Information for claimed listings */}
      {shouldShowContact && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">
            {user.role === 'donor' ? 'Recipient Contact:' : 'Donor Contact:'}
          </div>
          {loadingContact ? (
            <div className="text-sm text-gray-500">Loading contact info...</div>
          ) : contactInfo ? (
            contactInfo.error ? (
              <div className="text-sm text-red-600">{contactInfo.error}</div>
            ) : (
              <div className="space-y-1">
                {contactInfo.name && (
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Name:</span> {contactInfo.name}
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Phone:</span> {contactInfo.phone}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500">Contact info not available</div>
          )}
        </div>
      )}
      
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