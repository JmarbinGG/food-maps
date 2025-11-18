function ListingCard({ listing, onClaim, onSelect, user }) {
  return (
    <div className="card mb-4 cursor-pointer" onClick={() => onSelect(listing)}>
      <h4 className="font-semibold">{listing.title}</h4>
      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm">{listing.qty} {listing.unit}</span>
        <span className={`status-${listing.status}`}>{listing.status}</span>
      </div>
      {listing.status === 'available' && user?.role === 'recipient' && (
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