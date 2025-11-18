function ListingDetailModal({ listing, onClose, onClaim, user }) {
  if (!listing) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <p className="text-gray-600 mb-4">{listing.description}</p>
        <div className="space-y-2 mb-4">
          <div>Quantity: {listing.qty} {listing.unit}</div>
          <div>Category: {listing.category}</div>
          <div>Status: <span className={`status-${listing.status}`}>{listing.status}</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          {listing.status === 'available' && user?.role === 'recipient' && (
            <button onClick={() => onClaim(listing.id)} className="btn-primary flex-1">Claim</button>
          )}
        </div>
      </div>
    </div>
  );
}