function ListingCard({ listing = {}, onClaim = () => {}, onSelect = () => {}, user }) {
  if (!listing || !listing.id) {
    return (
      <div className="card">
        <div className="text-[var(--text-secondary)] text-sm">Loading listing...</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'claimed': return 'status-claimed';
      case 'completed': return 'status-completed';
      default: return 'bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const canClaim = user && user.role === 'recipient' && listing.status === 'available';

  try {
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-lg transition-all duration-200 group"
        data-name="listing-card" 
        data-file="components/ListingCard.js"
      >
        {/* Image Section */}
        <div className="relative">
          {(() => {
            // Use listing images if available, otherwise fallback to category-based images
            let imageUrl = null;
            let altText = listing.title;

            if (listing.images && listing.images.length > 0) {
              imageUrl = listing.images[0];
            } else {
              // Fallback to category-based images from our assets
              switch (listing.category?.toLowerCase()) {
                case 'produce':
                  imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';
                  altText = 'Fresh Vegetables';
                  break;
                case 'prepared':
                  imageUrl = 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600';
                  altText = 'Prepared Food';
                  break;
                case 'packaged':
                  imageUrl = 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600';
                  altText = 'Packaged Foods';
                  break;
                case 'bakery':
                  imageUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600';
                  altText = 'Bakery Items';
                  break;
                case 'seafood':
                  imageUrl = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600';
                  altText = 'Fresh Seafood';
                  break;
                case 'soup':
                  imageUrl = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600';
                  altText = 'Soup';
                  break;
                case 'baby_food':
                  imageUrl = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600';
                  altText = 'Baby Food';
                  break;
                case 'catering':
                  imageUrl = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600';
                  altText = 'Catering';
                  break;
                case 'international':
                  imageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600';
                  altText = 'International Foods';
                  break;
                default:
                  imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';
                  altText = 'Food Item';
              }
            }

            if (imageUrl) {
              return (
                <>
                  <img 
                    src={imageUrl} 
                    alt={altText}
                    className="w-full h-48 object-cover rounded-t-xl"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const parent = e.target.parentElement;
                      parent.innerHTML = `
                        <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                          <div class="text-center text-gray-400">
                            <div class="icon-image text-4xl mb-2"></div>
                            <p class="text-sm font-medium">No image</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`${getStatusColor(listing.status)} shadow-sm`}>
                      {listing.status}
                    </span>
                  </div>
                </>
              );
            } else {
              return (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center relative">
                  <div className="text-center text-gray-400">
                    <div className="icon-image text-4xl mb-2"></div>
                    <p className="text-sm font-medium">No image</p>
                  </div>
                  {/* Status Badge Overlay for no image */}
                  <div className="absolute top-3 right-3">
                    <span className={`${getStatusColor(listing.status)} shadow-sm`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              );
            }
          })()}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight group-hover:text-[var(--primary-color)] transition-colors">
            {listing.title}
          </h3>

          {/* Category and Quantity */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Category:</span>
              <span className="text-[var(--text-primary)] font-medium capitalize">{listing.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Quantity:</span>
              <span className="text-[var(--text-primary)] font-medium">{listing.qty} {listing.unit}</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2 text-sm pt-2 border-t border-gray-100">
            <div className="icon-map-pin text-[var(--primary-color)] text-base mt-0.5 flex-shrink-0"></div>
            <span className="text-[var(--text-secondary)] leading-relaxed">{listing.address}</span>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(listing);
              }}
              className="w-full bg-[var(--primary-color)] text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-[var(--accent-color)] transition-colors flex items-center justify-center space-x-2 group-hover:shadow-md"
            >
              <div className="icon-eye text-base"></div>
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ListingCard component error:', error);
    return null;
  }
}
