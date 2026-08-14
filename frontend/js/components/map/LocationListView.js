function LocationListView({ listings, onListingClick, userLocation }) {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Food Listings</h3>
      {listings.map(listing => (
        <div key={listing.id} className="card mb-3 cursor-pointer" onClick={() => onListingClick(listing)}>
          <h4 className="font-semibold">{listing.title}</h4>
          <p className="text-sm text-gray-600">{listing.description}</p>
          <div className="flex justify-between mt-2">
            <span>{listing.qty} {listing.unit}</span>
            <span className={`status-${listing.status}`}>{listing.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}