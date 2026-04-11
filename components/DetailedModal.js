// Detailed Modal Component for Food Listings
function getEffectiveStatusFromListing(listing) {
  try {
    if (typeof window !== 'undefined' && typeof window.getEffectiveListingStatus === 'function') {
      return String(window.getEffectiveListingStatus(listing) || '').toLowerCase();
    }
  } catch (_) {
    // Fall through to local calculation.
  }

  const rawStatus = String(listing?.status || '').toLowerCase();
  if (rawStatus && rawStatus !== 'available') return rawStatus;

  const toTimestamp = (value) => {
    if (!value) return null;
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : null;
  };

  const deadlines = [
    toTimestamp(listing?.pickup_window_end),
    toTimestamp(listing?.expiration_date)
  ].filter((value) => value != null);

  if (deadlines.length && Math.min(...deadlines) <= Date.now()) return 'expired';
  return rawStatus || 'available';
}

function DetailedModal({ listing, onClose, onClaim }) {
  const [contactInfo, setContactInfo] = React.useState(null);
  const [loadingContact, setLoadingContact] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(null);
  const [urgencyLevel, setUrgencyLevel] = React.useState(null);

  if (!listing) return null;

  const listingStatus = getEffectiveStatusFromListing(listing);
  const isClaimed = listingStatus === 'claimed' || listingStatus === 'pending_confirmation';

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const stored = localStorage.getItem('current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const user = getCurrentUser();

  // Check if user should see contact info
  const shouldShowContact = React.useMemo(() => {
    console.log('DetailedModal shouldShowContact check:', {
      listingId: listing.id,
      user: user,
      listingStatus: listingStatus,
      status: listing.status
    });

    if (!user || listingStatus !== 'claimed') {
      console.log('DetailedModal: returning false - no user or not claimed');
      return false;
    }
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

    const result = (user.role === 'donor' && donorId === userId) ||
      (user.role === 'recipient' && isClaimedByMe);
    console.log('DetailedModal shouldShowContact result:', result, {
      isDonor: user.role === 'donor' && donorId === userId,
      isRecipient: user.role === 'recipient' && isClaimedByMe
    });

    // Donor can see recipient contact, recipient can see donor contact
    return result;
  }, [user, listing, listingStatus]);

  // Fetch contact info when modal opens and contact should be shown
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
          console.log('Contact API response data:', data);
          // Check if data has actual values (not just empty strings)
          const hasName = data.name && data.name.trim() !== '';
          const hasPhone = data.phone && data.phone.trim() !== '';

          if (hasName || hasPhone) {
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

  // Calculate urgency and time remaining
  React.useEffect(() => {
    const calculateUrgency = () => {
      const expirationDate = listing.expiration_date || listing.pickup_window_end;
      if (!expirationDate) {
        setTimeRemaining(null);
        setUrgencyLevel(null);
        return;
      }

      const now = new Date();
      const expiry = new Date(expirationDate);
      const diffMs = expiry - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffMs <= 0) {
        setTimeRemaining('EXPIRED');
        setUrgencyLevel('expired');
        return;
      }

      // Calculate time remaining display
      const days = Math.floor(diffHours / 24);
      const hours = Math.floor(diffHours % 24);
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let display;
      if (days > 0) {
        display = `${days}d ${hours}h`;
      } else if (hours > 0) {
        display = `${hours}h ${minutes}m`;
      } else {
        display = `${minutes}m`;
      }
      setTimeRemaining(display);

      // Determine urgency level
      const perishability = listing.perishability || 'medium';
      let urgency;

      if (perishability === 'high') {
        if (diffHours < 2) urgency = 'critical';
        else if (diffHours < 6) urgency = 'high';
        else if (diffHours < 24) urgency = 'medium';
        else urgency = 'low';
      } else if (perishability === 'medium') {
        if (diffHours < 6) urgency = 'high';
        else if (diffHours < 24) urgency = 'medium';
        else urgency = 'low';
      } else {
        if (diffHours < 24) urgency = 'medium';
        else urgency = 'low';
      }

      setUrgencyLevel(urgency);
    };

    calculateUrgency();
    const interval = setInterval(calculateUrgency, 60000);
    return () => clearInterval(interval);
  }, [listing.expiration_date, listing.pickup_window_end, listing.perishability]);

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
    const normalized = String(status || '').toLowerCase();
    if (['available', 'claimed', 'pending_confirmation', 'expired', 'completed'].includes(normalized)) {
      return `status-${normalized}`;
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getDisplayStatus = (status) => {
    if (!status) return 'Unknown';
    if (status === 'pending_confirmation') return 'Pending Confirmation';
    return status
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getUrgencyDisplay = () => {
    if (!urgencyLevel || !timeRemaining) return null;

    const styles = {
      critical: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
      high: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      medium: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      low: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      expired: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    };

    const icons = {
      critical: '',
      high: '',
      medium: '⏰',
      low: '',
      expired: ''
    };

    const messages = {
      critical: 'URGENT - Claim immediately!',
      high: 'Expiring soon - Act fast',
      medium: 'Available - Moderate timeline',
      low: 'Good availability',
      expired: 'This item has expired'
    };

    return {
      style: styles[urgencyLevel],
      icon: icons[urgencyLevel],
      message: messages[urgencyLevel],
      time: timeRemaining
    };
  };

  const urgencyDisplay = getUrgencyDisplay();

  const statusBadgeClass = getStatusBadgeClass(listingStatus);
  const categoryImage = getCategoryImage(listing.category);
  const canClaim = listingStatus === 'available';

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
        // Urgency Banner
        urgencyDisplay && listingStatus === 'available' && React.createElement('div', {
          className: `${urgencyDisplay.style} rounded-lg p-4 mb-4 flex items-center gap-3 ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`
        },
          React.createElement('span', { className: 'text-3xl' }, urgencyDisplay.icon),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('div', { className: 'font-bold text-lg' }, urgencyDisplay.message),
            React.createElement('div', { className: 'text-sm opacity-90' }, `Time remaining: ${urgencyDisplay.time}`)
          )
        ),

        // Image
        React.createElement('img', {
          src: categoryImage,
          alt: listing.title,
          className: 'w-full h-32 object-cover rounded-lg mb-4'
        }),

        // Title and Status
        React.createElement('h3', { className: 'font-bold text-lg mb-2' }, listing.title),

        // Trust Badges
        listing.donor && React.createElement('div', { className: 'mb-3' },
          React.createElement(TrustBadge, {
            verifiedByAGLF: listing.donor.verified_by_aglf,
            schoolPartner: listing.donor.school_partner,
            partnerBadge: listing.donor.partner_badge,
            partnerSince: listing.donor.partner_since,
            lastActive: listing.donor.last_active,
            trustScore: listing.donor.trust_score,
            size: 'default',
            showDetails: true
          })
        ),

        React.createElement('span', {
          className: `inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusBadgeClass} mb-4`
        }, getDisplayStatus(listingStatus)),

        // Description
        listing.description && React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Description'),
          React.createElement('p', { className: 'text-gray-700' }, listing.description)
        ),

        // Storage Guidance
        window.StorageGuidance && React.createElement(window.StorageGuidance, {
          category: listing.category,
          isFrozen: listing.is_frozen || false,
          isRefrigerated: listing.is_refrigerated || false,
          showDetails: true
        }),

        // Expiration Date Education
        listing.expiration_date && window.ExpirationEducation && React.createElement(window.ExpirationEducation, {
          expirationDate: listing.expiration_date,
          labelType: listing.date_label_type,
          category: listing.category,
          perishability: listing.perishability,
          showFull: true
        }),

        // Allergen and Dietary Information
        ((listing.allergens && listing.allergens !== '[]') || listing.dietary_tags || listing.contamination_warning) &&
        window.AllergenDietaryPanel && React.createElement(window.AllergenDietaryPanel, {
          allergens: listing.allergens ? JSON.parse(listing.allergens) : [],
          contaminationWarning: listing.contamination_warning,
          dietaryTags: listing.dietary_tags ? JSON.parse(listing.dietary_tags) : [],
          ingredientsList: listing.ingredients_list,
          showDetails: true
        }),

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

        // Contact Information for claimed listings
        shouldShowContact && React.createElement('div', { className: 'mb-4 p-4 bg-green-50 border border-green-200 rounded-lg' },
          React.createElement('h4', { className: 'font-semibold mb-2 text-green-800' },
            user.role === 'donor' ? 'Recipient Contact Information:' : 'Donor Contact Information:'
          ),
          loadingContact ?
            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Loading contact info...') :
            contactInfo ?
              contactInfo.error ?
                React.createElement('div', { className: 'text-sm text-red-600' }, contactInfo.error) :
                React.createElement('div', { className: 'space-y-2' },
                  contactInfo.name && React.createElement('div', { className: 'text-sm text-green-700' },
                    React.createElement('span', { className: 'font-medium' }, 'Name: '),
                    contactInfo.name
                  ),
                  contactInfo.phone && React.createElement('div', { className: 'text-sm text-green-700' },
                    React.createElement('span', { className: 'font-medium' }, 'Phone: '),
                    contactInfo.phone
                  )
                ) :
              React.createElement('div', { className: 'text-sm text-gray-500' }, 'Contact information not available')
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
        React.createElement('div', { className: 'flex gap-3 mb-3' },
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
        ),

        // Storage Coach Button
        window.StorageCoachButton && React.createElement(window.StorageCoachButton, {
          listing: listing,
          compact: false
        })
      )
    )
  );
}

window.DetailedModal = DetailedModal;