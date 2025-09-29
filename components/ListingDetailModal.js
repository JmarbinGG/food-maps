function ListingDetailModal({ listing, onClose, onClaim, user }) {
  if (!listing) return null;

  const canClaim = user && user.role === 'recipient' && listing.status === 'available';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'claimed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPerishabilityInfo = (level) => {
    switch (level) {
      case 'high': return { text: 'High - Consume within hours', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' };
      case 'medium': return { text: 'Medium - Consume within days', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' };
      case 'low': return { text: 'Low - Shelf stable', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' };
      default: return { text: 'Not specified', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' };
    }
  };

  const perishabilityInfo = getPerishabilityInfo(listing.perishability);

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Food Listing Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <div className="icon-x text-xl"></div>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header with title and status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="w-full">
              <div className="relative">
                {(() => {
                  let imageUrl = null;
                  let altText = listing.title;

                  if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
                    imageUrl = listing.images[0];
                  } else {
                    // Fallback to category-based images
                    switch (listing.category?.toLowerCase()) {
                      case 'produce':
                        imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
                        altText = 'Fresh Vegetables';
                        break;
                      case 'prepared':
                        imageUrl = 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300';
                        altText = 'Prepared Food';
                        break;
                      default:
                        imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
                        altText = 'Food Item';
                    }
                  }

                  if (imageUrl) {
                    return (
                      <>
                        <img 
                          src={imageUrl} 
                          alt={altText}
                          className="w-full h-80 object-cover rounded-xl border border-gray-200 shadow-lg"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvb2QgSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        {listing.images && Array.isArray(listing.images) && listing.images.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                            +{listing.images.length - 1} more
                          </div>
                        )}
                      </>
                    );
                  }
                })()}
              </div>
              {listing.images && Array.isArray(listing.images) && listing.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                  {listing.images.slice(1, 4).map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${listing.title} ${index + 2}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Food Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Food Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900 capitalize">{listing.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">{listing.qty} {listing.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Perishability:</span>
                    <span className={`font-medium ${perishabilityInfo.color}`}>{perishabilityInfo.text}</span>
                  </div>
                  {listing.dietary_info && Array.isArray(listing.dietary_info) && listing.dietary_info.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Dietary:</span>
                      <div className="flex flex-wrap gap-1">
                        {listing.dietary_info.map((info, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {info}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {listing.allergens && Array.isArray(listing.allergens) && listing.allergens.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Allergens:</span>
                      <div className="flex flex-wrap gap-1">
                        {listing.allergens.map((allergen, idx) => (
                          <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pickup Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 block mb-1">Address:</span>
                    <span className="font-medium text-gray-900">{listing.address}</span>
                  </div>
                  {listing.contact_info && (
                    <div>
                      <span className="text-gray-600 block mb-1">Contact:</span>
                      <span className="font-medium text-gray-900">{listing.contact_info}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              {canClaim ? (
                <button
                  onClick={() => {
                    onClaim(listing.id);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <div className="icon-shopping-bag text-lg mr-2 inline-block"></div>
                  Claim This Food
                </button>
              ) : listing.status === 'claimed' ? (
                <div className="flex-1 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-center">
                  Already Claimed
                </div>
              ) : (
                <div className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium text-center">
                  Not Available
                </div>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ListingDetailModal component error:', error);
    return null;
  }
}