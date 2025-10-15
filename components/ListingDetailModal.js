function ListingDetailModal({ listing, onClose, onClaim, user }) {
  if (!listing) return null;

  const [isEditing, setIsEditing] = React.useState(false);
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
                  <div className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center">Not Available</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Expose globally for Babel in-browser usage
try { window.ListingDetailModal = ListingDetailModal; } catch (e) {}