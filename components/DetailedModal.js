// Detailed Modal Component for Food Listings
function DetailedModal({ listing, onClose, onClaim }) {
  if (!listing) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
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

  const getCategoryImage = (category) => {
    const categoryImages = {
      'produce': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      'packaged': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300',
      'prepared': 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300',
      'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
      'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
    };
    return categoryImages[category] || categoryImages['packaged'];
  };

  const getPerishabilityInfo = (perishability) => {
    const perishabilityMap = {
      'high': 'High - Consume within hours',
      'medium': 'Medium - Consume within days', 
      'low': 'Low - Shelf stable'
    };
    return perishabilityMap[perishability] || perishability;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'available': 'bg-green-100 text-green-800 border-green-200',
      'claimed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const statusBadgeClass = getStatusBadgeClass(listing.status);
  const categoryImage = getCategoryImage(listing.category);
  const canClaim = listing.status === 'available';

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl',
      onClick: (e) => e.stopPropagation()
    },
      // Header
      React.createElement('div', {
        className: 'flex items-center justify-between p-4 border-b border-gray-200'
      },
        React.createElement('h2', { className: 'font-bold text-xl text-gray-900' }, 'Food Listing Details'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-3 hover:bg-gray-100 rounded-full transition-colors',
          'aria-label': 'Close',
          title: 'Close'
        },
          React.createElement('div', { className: 'icon-x text-2xl text-gray-500' })
        )
      ),

      React.createElement('div', { className: 'p-4' },
        // Image
        React.createElement('img', {
          src: categoryImage,
          alt: listing.title,
          className: 'w-full h-32 object-cover rounded-lg mb-4'
        }),

        // Title and Status
        React.createElement('h3', { className: 'font-bold text-lg mb-2' }, listing.title),
        React.createElement('span', {
          className: `inline-block px-3 py-1 text-sm font-semibold rounded-full border ${statusBadgeClass} mb-4`
        }, listing.status.charAt(0).toUpperCase() + listing.status.slice(1)),
        React.createElement('h3', { className: 'font-bold text-lg mb-4' }, listing.title),

        // Description
        listing.description && React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Description'),
          React.createElement('p', { className: 'text-gray-700' }, listing.description)
        ),

        // Food Information
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Food Information'),
          React.createElement('div', { className: 'text-sm space-y-1' },
            React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Category:'),
              React.createElement('span', { className: 'capitalize' }, listing.category)
            ),
            React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Quantity:'),
              React.createElement('span', {}, `${listing.qty} ${listing.unit}`)
            ),
            React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Perishability:'),
              React.createElement('span', {}, getPerishabilityInfo(listing.perishability))
            ),
            listing.expiration_date && React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Expires:'),
              React.createElement('span', {}, formatDateTime(listing.expiration_date))
            )
          )
        ),

        // Pickup Information
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Pickup Information'),
          React.createElement('div', { className: 'text-sm space-y-1' },
            React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Address:'),
              React.createElement('span', {}, listing.address)
            ),
            listing.pickup_window_start && React.createElement('div', {},
              React.createElement('span', { className: 'block' }, 'Pickup Window:'),
              React.createElement('div', {},
                React.createElement('div', {}, `From: ${formatDateTime(listing.pickup_window_start)}`),
                listing.pickup_window_end && React.createElement('div', {}, `To: ${formatDateTime(listing.pickup_window_end)}`)
              )
            )
          )
        ),

        // Listing Information
        React.createElement('div', { className: 'mb-6' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Listing Information'),
          React.createElement('div', { className: 'text-sm' },
            React.createElement('div', {}, `Posted on: ${formatDateTime(listing.created_at)}`),
            React.createElement('div', {}, `Listing ID: ${listing.id}`)
          )
        ),

        // Action Buttons
        React.createElement('div', { className: 'flex gap-3' },
          canClaim && React.createElement('button', {
            onClick: () => onClaim && onClaim(listing.id),
            className: 'flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors'
          }, 'Claim This Food'),
          React.createElement('button', {
            onClick: () => {
              if (listing.coords) {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${listing.coords.lat},${listing.coords.lng}&travelmode=driving`;
                window.open(url, '_blank');
              }
            },
            className: 'flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors'
          }, 'Get Directions')
        )
      )
    )
  );
}

window.DetailedModal = DetailedModal;