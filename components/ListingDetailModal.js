function ListingDetailModal({ listing, onClose, onClaim, user }) {
  if (!listing) return null;

  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
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
      if (!canEdit) { alert('You are not authorized to edit this listing.'); return; }
      if (window.databaseService && window.databaseService.updateListing) {
        const resp = await window.databaseService.updateListing(listing.id, {
          title: editData.title,
          desc: editData.description,
          qty: editData.qty,
          unit: editData.unit,
          address: editData.address
        });
        if (!resp || !resp.success) {
          alert(resp?.error || 'Failed to save changes.');
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
      alert('Failed to save changes.');
    }
    window.location.reload();
  };

  const handleDelete = async () => {
    try {
      if (!canEdit) { alert('You are not authorized to delete this listing.'); return; }
      // Require a real auth token (demo login will not work for protected endpoints)
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setShowDeleteConfirm(false);
        alert('Please sign in to delete this listing. Use a donor account that owns the listing.');
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
          alert('Your session is missing or expired. Please sign in to continue.');
          try { if (window.openAuthModal) window.openAuthModal(); } catch (e) {}
        } else if (lastStatus === 403) {
          alert('You can only delete listings you own.');
        } else if (lastError && (lastError.name === 'AbortError' || /timeout/i.test(String(lastError.message)))) {
          alert('The server didn’t respond. Check your API URL and network, then try again.');
        } else {
          alert('Failed to delete listing.');
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
      alert('Failed to delete listing.');
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