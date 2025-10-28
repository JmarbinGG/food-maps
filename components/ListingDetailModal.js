function ListingDetailModal({ listing, onClose, onClaim, user }) {
  if (!listing) return null;

  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [contact, setContact] = React.useState(null);
  const [contactError, setContactError] = React.useState(null);
  const [contactLoading, setContactLoading] = React.useState(false);
  const [editData, setEditData] = React.useState({
    title: listing.title || '',
    description: listing.description || '',
    qty: listing.qty || '',
    unit: listing.unit || '',
    address: listing.address || ''
  });

  const canClaim = user && String(user.role).toLowerCase() === 'recipient' && ((listing.status || '').toString().toLowerCase() === 'available');
  // Only the listing owner can edit; detect owner robustly
  let currentUserId = null;
  // Prefer prop.user.id if present
  if (user && user.id != null) currentUserId = String(user.id);
  if (!currentUserId) {
    try {
      const cu = JSON.parse(localStorage.getItem('current_user'));
      currentUserId = cu && (cu.id || cu.user_id || cu.sub) ? String(cu.id || cu.user_id || cu.sub) : null;
    } catch (e) { /* ignore */ }
  }
  // Support multiple donor/owner id shapes
  const rawDonorId = (listing && (
    (listing.donor_id != null ? listing.donor_id : null) ??
    (listing.donorId != null ? listing.donorId : null) ??
    (listing.owner_id != null ? listing.owner_id : null) ??
    (listing.ownerId != null ? listing.ownerId : null) ??
    (listing.donor && listing.donor.id != null ? listing.donor.id : null)
  ));
  const listingDonorId = rawDonorId != null ? String(rawDonorId) : null;
  const userRole = String(user && user.role ? user.role : (JSON.parse(localStorage.getItem('current_user')||'{}').role || '')).toLowerCase();
  const canEdit = userRole === 'donor' && currentUserId && listingDonorId && (currentUserId === listingDonorId);

  // Determine if this listing is claimed by me (recipient) using backend field or local fallback
  const isClaimedByMe = React.useMemo(() => {
    if (!currentUserId) return false;
    const status = String(listing.status || '').toLowerCase();
    if (status !== 'claimed') return false;
    const rid = listing.recipient_id ?? listing.recipientId ?? null;
    if (rid != null && String(rid) === String(currentUserId)) return true;
    // Fallback to localStorage cache set at claim time
    try {
      const key = `my_claimed_ids:${currentUserId}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) && arr.some(id => String(id) === String(listing.id));
    } catch (_) { return false; }
  }, [listing, currentUserId]);

  // Fetch counterparty contact if eligible
  React.useEffect(() => {
    let cancelled = false;
    async function fetchContact() {
      try {
        setContactError(null);
        setContact(null);
        setContactLoading(true);
        if (!window.listingAPI || typeof window.listingAPI.getCounterparty !== 'function') {
          throw new Error('Contact API not available');
        }
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Not signed in');
        }
        const data = await window.listingAPI.getCounterparty(listing.id, { timeout: 10000 });
        if (!cancelled) setContact(data || null);
      } catch (e) {
        if (!cancelled) setContactError(e?.message || 'Failed to fetch contact');
      } finally {
        if (!cancelled) setContactLoading(false);
      }
    }

    const status = String(listing.status || '').toLowerCase();
    const shouldFetch = (
      status === 'claimed' && (
        (userRole === 'recipient' && isClaimedByMe) ||
        (userRole === 'donor' && canEdit)
      )
    );
    if (shouldFetch) {
      fetchContact();
    } else {
      setContact(null);
      setContactError(null);
      setContactLoading(false);
    }
    return () => { cancelled = true; };
  }, [listing.id, listing.status, userRole, isClaimedByMe, canEdit]);

  const getStatusColor = (status) => {
    switch ((status || '').toString().toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'claimed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const saveEdits = async () => {
    try {
  if (!canEdit) { if (typeof window.showAlert === 'function') window.showAlert('You are not authorized to edit this listing.', { title: 'Not allowed', variant: 'error' }); return; }
      if (window.databaseService && window.databaseService.updateListing) {
        const resp = await window.databaseService.updateListing(listing.id, {
          title: editData.title,
          desc: editData.description,
          qty: editData.qty,
          unit: editData.unit,
          address: editData.address
        });
        if (!resp || !resp.success) {
          if (typeof window.showAlert === 'function') window.showAlert(resp?.error || 'Failed to save changes.', { title: 'Error', variant: 'error' });
          return;
        }
        const updated = resp.data;
        if (updated) {
          try {
            if (window.databaseService && Array.isArray(window.databaseService.listings)) {
              const idx = window.databaseService.listings.findIndex(l => String(l.id) === String(listing.id));
              if (idx !== -1) window.databaseService.listings[idx] = { ...window.databaseService.listings[idx], ...updated };
            }
          } catch (e) { /* ignore */ }
        }
      }
      try { if (window.recenterMap) window.recenterMap(); } catch(e){}
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save listing edits', e);
  if (typeof window.showAlert === 'function') window.showAlert('Failed to save changes.', { title: 'Error', variant: 'error' });
    }
    window.location.reload();
  };

  const handleDelete = async () => {
    try {
  if (!canEdit) { if (typeof window.showAlert === 'function') window.showAlert('You are not authorized to delete this listing.', { title: 'Not allowed', variant: 'error' }); return; }
      // Require a real auth token (demo login will not work for protected endpoints)
      const token = localStorage.getItem('auth_token');
      if (!token) {
  setShowDeleteConfirm(false);
  if (typeof window.showAlert === 'function') window.showAlert('Please sign in to delete this listing. Use a donor account that owns the listing.', { title: 'Sign in required', variant: 'error' });
        try { if (window.openAuthModal) window.openAuthModal(); } catch (e) {}
        return;
      }
      setIsDeleting(true);
      let ok = false;
      let lastStatus = null;
      let lastError = null;
      // Prefer unified API helper if present
      if (window.listingAPI && typeof window.listingAPI.delete === 'function') {
        try {
          await window.listingAPI.delete(listing.id, { timeout: 10000 });
          ok = true;
        } catch (err) {
          console.error('listingAPI.delete failed, falling back:', err);
          lastError = err;
          try {
            // Extract status code if embedded in message
            const m = (err && err.message) ? err.message.match(/API Error:\s*(\d{3})/) : null;
            if (m && m[1]) lastStatus = parseInt(m[1], 10);
          } catch (_) {}
        }
      }
      // Fallback direct fetch to backend route
      if (!ok) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 10000);
          const resp = await fetch(`/api/listings/get/${listing.id}`, { method: 'DELETE', headers, signal: controller.signal });
          clearTimeout(timer);
          ok = resp && resp.ok;
          lastStatus = resp ? resp.status : lastStatus;
        } catch (err) {
          console.error('Direct DELETE failed:', err);
          lastError = err;
        }
      }
      if (!ok) {
        // Tailored auth/permission messaging
        if (lastStatus === 401) {
          setShowDeleteConfirm(false);
          if (typeof window.showAlert === 'function') window.showAlert('Your session is missing or expired. Please sign in to continue.', { title: 'Session expired', variant: 'error' });
          try { if (window.openAuthModal) window.openAuthModal(); } catch (e) {}
        } else if (lastStatus === 403) {
          if (typeof window.showAlert === 'function') window.showAlert('You can only delete listings you own.', { title: 'Not allowed', variant: 'error' });
        } else if (lastError && (lastError.name === 'AbortError' || /timeout/i.test(String(lastError.message)))) {
          if (typeof window.showAlert === 'function') window.showAlert('The server didn’t respond. Check your API URL and network, then try again.', { title: 'Timeout', variant: 'error' });
        } else {
          if (typeof window.showAlert === 'function') window.showAlert('Failed to delete listing.', { title: 'Error', variant: 'error' });
        }
        setIsDeleting(false);
        return;
      }

      // Remove from local snapshot to keep UI in sync
      try {
        if (window.databaseService && Array.isArray(window.databaseService.listings)) {
          window.databaseService.listings = window.databaseService.listings.filter(l => String(l.id) !== String(listing.id));
        }
      } catch (e) { /* ignore */ }

      try { if (window.recenterMap) window.recenterMap(); } catch(e){}
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      if (typeof onClose === 'function') onClose();
    } catch (e) {
      console.error('Delete listing error', e);
  if (typeof window.showAlert === 'function') window.showAlert('Failed to delete listing.', { title: 'Error', variant: 'error' });
      setIsDeleting(false);
    }
    window.location.reload();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Food Listing Details</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={() => setIsEditing(prev => !prev)} className="text-sm px-3 py-2 bg-blue-50 border border-blue-100 rounded text-blue-700">
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
              {((listing.status || '').toString().charAt(0).toUpperCase() + (listing.status || '').toString().slice(1))}
            </span>
          </div>

          {isEditing && canEdit ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Title</label>
                <input value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Description</label>
                <textarea value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-600">Quantity</label>
                  <input value={editData.qty} onChange={(e)=>setEditData({...editData, qty: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Unit</label>
                  <input value={editData.unit} onChange={(e)=>setEditData({...editData, unit: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Address</label>
                <input value={editData.address} onChange={(e)=>setEditData({...editData, address: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdits} className="btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">Delete Listing</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Category</div>
                <div className="font-medium">{listing.category || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Quantity</div>
                <div className="font-medium">{listing.qty} {listing.unit}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pickup Address</div>
                <div className="font-medium">{listing.address}</div>
              </div>

              {/* Contact info for counterpart when claimed and authorized */}
              {String(listing.status || '').toLowerCase() === 'claimed' && (
                (userRole === 'recipient' && isClaimedByMe) || (userRole === 'donor' && canEdit)
              ) && (
                <div className="mt-2 p-3 border border-blue-200 rounded bg-blue-50">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    {userRole === 'recipient' ? 'Donor Contact' : 'Recipient Contact'}
                  </div>
                  {contactLoading ? (
                    <div className="text-sm text-blue-800">Loading contact…</div>
                  ) : contactError ? (
                    <div className="text-sm text-red-700">{contactError}</div>
                  ) : contact ? (
                    <div className="text-sm text-blue-900">
                      <div><span className="font-semibold">Name:</span> {contact.name || '—'}</div>
                      <div><span className="font-semibold">Phone:</span> {contact.phone || '—'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-blue-800">Contact not available.</div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {canClaim ? (
                  <button onClick={() => { onClaim(listing.id); onClose(); }} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">Claim This Food</button>
                ) : listing.status === 'claimed' ? (
                  <div className="flex-1 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-center">Already Claimed</div>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center">{userRole === 'donor' ? 'Only recipients can claim food' : 'Not Available'}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !isDeleting && setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete listing?</h3>
                <p className="mt-1 text-sm text-gray-600">This action cannot be undone. "{listing.title}" will be permanently removed.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button disabled={isDeleting} onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
              <button disabled={isDeleting} onClick={handleDelete} className="btn-danger">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Expose globally for Babel in-browser usage
try { window.ListingDetailModal = ListingDetailModal; } catch (e) {}