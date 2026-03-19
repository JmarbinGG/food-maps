function ListingCard({ listing, onClaim, onSelect, user }) {
  const [contactInfo, setContactInfo] = React.useState(null);
  const [loadingContact, setLoadingContact] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(null);
  const [urgencyLevel, setUrgencyLevel] = React.useState(null);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [savingFavorite, setSavingFavorite] = React.useState(false);

  // Check if this listing is claimed by the current user
  const isClaimedByMe = React.useMemo(() => {
    if (!user) return false;
    const userId = String(user.id);

    // Check recipient_id
    const recipientId = listing.recipient_id ?? listing.recipientId ?? listing.recipient?.id;
    if (recipientId && String(recipientId) === userId) return true;

    // Check localStorage fallback
    try {
      const key = `my_claimed_ids:${userId}`;
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(arr) && arr.includes(String(listing.id));
    } catch (_) {
      return false;
    }
  }, [listing, user]);

  // Check if listing is favorited
  React.useEffect(() => {
    if (!user) return;

    const checkFavorite = async () => {
      try {
        const isFav = await window.favoritesAPI.isFavorited(listing.donor_id);
        setIsFavorite(isFav);
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };

    if (window.favoritesAPI) {
      checkFavorite();
    }
  }, [user, listing.donor_id]);

  // Toggle favorite
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user || savingFavorite) return;

    setSavingFavorite(true);

    try {
      if (isFavorite) {
        // Remove from favorites - find the favorite ID first
        const favorites = await window.favoritesAPI.getAll();
        const existingFav = favorites.find(f => f.donor && f.donor.id === listing.donor_id);

        if (existingFav) {
          await window.favoritesAPI.remove(existingFav.id);
          setIsFavorite(false);

          if (window.showAlert) {
            window.showAlert('Removed from favorites', { variant: 'success' });
          }
        }
      } else {
        // Add to favorites using the API
        await window.favoritesAPI.addFromListing(listing);
        setIsFavorite(true);

        if (window.showAlert) {
          window.showAlert('⭐ Added to favorites! Access it from your profile menu.', { variant: 'success' });
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      if (window.showAlert) {
        window.showAlert('Failed to update favorites', { variant: 'error' });
      }
    } finally {
      setSavingFavorite(false);
    }
  };

  // Check if listing is in a claimed state
  const listingStatus = String(listing.status || '').toLowerCase();
  const isClaimed = listingStatus === 'claimed' || listingStatus === 'pending_confirmation';

  // Display user-friendly status
  const getDisplayStatus = () => {
    if (listingStatus === 'pending_confirmation') return 'Pending Confirmation';
    return listingStatus.charAt(0).toUpperCase() + listingStatus.slice(1);
  };
  const displayStatus = getDisplayStatus();

  // Check if user should see contact info (only after confirmation)
  const shouldShowContact = React.useMemo(() => {
    if (!user || listingStatus !== 'claimed') return false;
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

    // Donor can see recipient contact (if user is the donor)
    // Recipient can see donor contact (if user claimed it)
    return (user.role === 'donor' && donorId === userId) ||
      (user.role === 'recipient' && isClaimedByMe);
  }, [user, listing, listingStatus]);

  // Fetch contact info when needed
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
          if (data.name || data.phone) {
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

      // Determine urgency level based on perishability and time
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
    const interval = setInterval(calculateUrgency, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [listing.expiration_date, listing.pickup_window_end, listing.perishability]);

  // Get urgency badge styling
  const getUrgencyBadge = () => {
    if (!urgencyLevel || listingStatus !== 'available') return null;

    const badgeStyles = {
      critical: 'bg-red-600 text-white animate-pulse',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white',
      expired: 'bg-gray-600 text-white'
    };

    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '⏰',
      low: '✓',
      expired: '❌'
    };

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${badgeStyles[urgencyLevel]}`}>
        <span>{icons[urgencyLevel]}</span>
        <span>{timeRemaining}</span>
      </div>
    );
  };

  // Get verification status badge
  const getVerificationBadge = () => {
    if (!isClaimedByMe || listingStatus !== 'claimed') return null;

    const verificationStatus = listing.verification_status || 'pending';

    const badgeConfig = {
      pending: { icon: '📸', label: 'Photo Needed', bg: 'bg-yellow-500', action: 'before' },
      before_verified: { icon: '📦', label: 'Ready for Pickup', bg: 'bg-blue-500', action: 'after' },
      completed: { icon: '✅', label: 'Verified', bg: 'bg-green-600', action: null },
      not_required: { icon: '', label: '', bg: '', action: null }
    };

    const config = badgeConfig[verificationStatus] || badgeConfig.pending;

    if (verificationStatus === 'not_required') return null;

    return (
      <div
        className={`px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 ${config.bg} ${config.action ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={(e) => {
          if (config.action) {
            e.stopPropagation();
            if (config.action === 'before' && typeof window.openBeforePhotoVerification === 'function') {
              window.openBeforePhotoVerification(listing);
            } else if (config.action === 'after' && typeof window.openAfterPhotoVerification === 'function') {
              window.openAfterPhotoVerification(listing);
            }
          }
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  };

  // Get food safety badge
  const getSafetyBadge = () => {
    const safetyPassed = listing.safety_checklist_passed;
    const safetyScore = listing.safety_score || 0;

    // Don't show if no safety check has been done
    if (safetyPassed === undefined || safetyPassed === null) return null;

    if (safetyPassed) {
      return (
        <div className="px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white flex items-center gap-1">
          <span>🛡️</span>
          <span>Safety Verified {safetyScore}%</span>
        </div>
      );
    } else {
      return (
        <div className="px-2 py-1 rounded-full text-xs font-bold bg-gray-400 text-white flex items-center gap-1">
          <span>⚠️</span>
          <span>Safety Check Needed</span>
        </div>
      );
    }
  };

  // Get storage indicator
  const getStorageIndicator = () => {
    if (!listing.is_refrigerated && !listing.is_frozen) return null;

    if (listing.is_frozen) {
      return (
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
          <span>❄️</span>
          <span>Frozen</span>
        </div>
      );
    }

    if (listing.is_refrigerated) {
      return (
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
          <span>🌡️</span>
          <span>Refrigerated</span>
        </div>
      );
    }
  };

  // Get packaging quality indicator
  const getPackagingIndicator = () => {
    const condition = listing.packaging_condition;
    if (!condition || condition === 'unknown') return null;

    const badgeConfig = {
      excellent: { icon: '✨', label: 'Excellent', bg: 'bg-green-100', text: 'text-green-800' },
      good: { icon: '👍', label: 'Good', bg: 'bg-blue-100', text: 'text-blue-800' },
      fair: { icon: '⚠️', label: 'Fair', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      poor: { icon: '❌', label: 'Poor', bg: 'bg-red-100', text: 'text-red-800' }
    };

    const config = badgeConfig[condition];
    if (!config) return null;

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>Packaging: {config.label}</span>
      </div>
    );
  };

  return (
    <div className="card mb-4 cursor-pointer relative" onClick={() => onSelect(listing)}>
      {/* Favorite Button */}
      {user && (
        <button
          onClick={toggleFavorite}
          disabled={savingFavorite}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all z-10"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="text-2xl">{isFavorite ? '⭐' : '☆'}</span>
        </button>
      )}

      {/* Urgency Banner for Critical Items */}
      {urgencyLevel === 'critical' && listingStatus === 'available' && (
        <div className="mb-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse">
          <span className="text-lg">🚨</span>
          <div className="flex-1">
            <div className="font-bold text-sm">URGENT - Expires in {timeRemaining}!</div>
            <div className="text-xs opacity-90">Claim now before it expires</div>
          </div>
        </div>
      )}

      <h4 className="font-semibold">{listing.title}</h4>

      {/* Donor Trust Badges */}
      {listing.donor && (
        <div className="mb-2">
          <TrustBadgeCompact
            verifiedByAGLF={listing.donor.verified_by_aglf}
            schoolPartner={listing.donor.school_partner}
            partnerBadge={listing.donor.partner_badge}
            lastActive={listing.donor.last_active}
          />
        </div>
      )}

      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>

      {/* Storage Guidance */}
      <div className="mb-2">
        <StorageGuidanceCompact
          category={listing.category}
          isFrozen={listing.is_frozen}
          isRefrigerated={listing.is_refrigerated}
        />
      </div>

      {/* Expiration Education Badge */}
      {listing.expiration_date && window.ExpirationBadgeCompact && (
        <div className="mb-2">
          {React.createElement(window.ExpirationBadgeCompact, {
            expirationDate: listing.expiration_date,
            labelType: listing.date_label_type,
            category: listing.category,
            perishability: listing.perishability
          })}
        </div>
      )}

      {/* Allergen Warnings */}
      {listing.allergens && window.AllergenBadgesCompact && (
        <div className="mb-2">
          {React.createElement(window.AllergenBadgesCompact, {
            allergens: JSON.parse(listing.allergens || '[]'),
            contaminationWarning: listing.contamination_warning
          })}
        </div>
      )}

      {/* Dietary Tags */}
      {listing.dietary_tags && window.DietaryTagsCompact && (
        <div className="mb-2">
          {React.createElement(window.DietaryTagsCompact, {
            tags: JSON.parse(listing.dietary_tags || '[]')
          })}
        </div>
      )}

      {/* Safety and Storage Indicators */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {getSafetyBadge()}
        {getStorageIndicator()}
        {getPackagingIndicator()}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm">{listing.qty} {listing.unit}</span>
        <div className="flex gap-2 items-center flex-wrap">
          {getUrgencyBadge()}
          {getVerificationBadge()}
          <span className={`status-${listingStatus}`}>{displayStatus}</span>
        </div>
      </div>

      {/* Pending Confirmation Notice for recipient */}
      {listingStatus === 'pending_confirmation' && isClaimedByMe && user?.role === 'recipient' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">Waiting for Confirmation</p>
              <p className="text-xs text-yellow-800 mt-1">Click here to enter your code</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information for claimed listings */}
      {shouldShowContact && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">
            {user.role === 'donor' ? 'Recipient Contact:' : 'Donor Contact:'}
          </div>
          {loadingContact ? (
            <div className="text-sm text-gray-500">Loading contact info...</div>
          ) : contactInfo ? (
            contactInfo.error ? (
              <div className="text-sm text-red-600">{contactInfo.error}</div>
            ) : (
              <div className="space-y-1">
                {contactInfo.name && (
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Name:</span> {contactInfo.name}
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Phone:</span> {contactInfo.phone}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500">Contact info not available</div>
          )}
        </div>
      )}

      {/* Storage Coach Button - shown for all users */}
      {window.StorageCoachButton && (
        <div className="mt-3">
          <window.StorageCoachButton listing={listing} compact={true} />
        </div>
      )}

      {listingStatus === 'available' && !isClaimedByMe && user?.role === 'recipient' && (
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