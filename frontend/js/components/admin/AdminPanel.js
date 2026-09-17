function AdminPanel({ onClose }) {
  try {
    const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200';
    const [activeTab, setActiveTab] = React.useState('overview');
    const [dbStats, setDbStats] = React.useState({});
    const [centers, setCenters] = React.useState([]);
    const [showCenterForm, setShowCenterForm] = React.useState(false);
    const [editingCenter, setEditingCenter] = React.useState(null);
    const emptyCenterForm = {
      name: '',
      description: '',
      address: '',
      phone: '',
      hours: '',
      coords_lat: '',
      coords_lng: '',
      eligibility: '',
      languages: '',
      availability: '',
      website: '',
      social_facebook: '',
      social_instagram: '',
      social_twitter: '',
      social_youtube: '',
      social_linkedin: '',
      social_tiktok: '',
      coverage_areas: '',
      provider_types: '',
      logo_url: ''
    };
    const [centerForm, setCenterForm] = React.useState({ ...emptyCenterForm });
    const providerTypeOptions = (typeof window !== 'undefined' && Array.isArray(window.PROVIDER_TYPE_TAGS))
      ? window.PROVIDER_TYPE_TAGS
      : [
          'Food pantry', 'Mobile food pantry', 'Home delivery', 'Community fridge',
          'Community meal / hot meals', 'Senior meal program', 'School meal program',
          'Food box distribution', 'Grocery assistance', 'Farmers market',
          'Produce distribution', 'Food rescue', 'Community Closet', 'Community Garden',
          'School food distribution', 'Meal preparation program', 'Foodbank'
        ];
    const parseCenterTypes = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      } catch (_) { /* ignore */ }
      return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    };
    const selectedProviderTypes = parseCenterTypes(centerForm.provider_types);
    const toggleProviderType = (tag) => {
      const next = selectedProviderTypes.includes(tag)
        ? selectedProviderTypes.filter((t) => t !== tag)
        : [...selectedProviderTypes, tag];
      setCenterForm({ ...centerForm, provider_types: JSON.stringify(next) });
    };
    const availabilityOptions = [
      { value: '', label: 'Not specified' },
      { value: 'open', label: 'Open / Walk-in welcome' },
      { value: 'limited', label: 'Limited availability' },
      { value: 'appointment', label: 'Appointment / registration required' },
      { value: 'first_come', label: 'First come, first served' },
      { value: 'seasonal', label: 'Seasonal / schedule varies' },
      { value: 'closed', label: 'Temporarily closed' },
    ];
    const [referralStats, setReferralStats] = React.useState([]);
    const [referralLoading, setReferralLoading] = React.useState(false);
    const [listings, setListings] = React.useState([]);
    const [listingsLoading, setListingsLoading] = React.useState(false);
    const [showFeedbackViewer, setShowFeedbackViewer] = React.useState(false);
    const [centersError, setCentersError] = React.useState('');
    const [referralsError, setReferralsError] = React.useState('');
    const [listingsError, setListingsError] = React.useState('');
    const [pendingApprovals, setPendingApprovals] = React.useState([]);
    const [pendingApprovalsLoading, setPendingApprovalsLoading] = React.useState(false);
    const [pendingApprovalsError, setPendingApprovalsError] = React.useState('');
    const [pendingCount, setPendingCount] = React.useState(0);
    const [requireListingApproval, setRequireListingApproval] = React.useState(true);
    const [savingApprovalToggle, setSavingApprovalToggle] = React.useState(false);
    const [approvalBusyId, setApprovalBusyId] = React.useState(null);
    const [approvalBulkBusy, setApprovalBulkBusy] = React.useState(false);
    const [selectedPendingIds, setSelectedPendingIds] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [userCounts, setUserCounts] = React.useState({ all: 0, donor: 0, recipient: 0, admin: 0, driver: 0, volunteer: 0 });
    const [usersLoading, setUsersLoading] = React.useState(false);
    const [usersError, setUsersError] = React.useState('');
    const [userRoleFilter, setUserRoleFilter] = React.useState('all');
    const [userSearch, setUserSearch] = React.useState('');
    const [listingCategories, setListingCategories] = React.useState([]);
    const [listingCategoriesLoading, setListingCategoriesLoading] = React.useState(false);
    const [listingCategoriesError, setListingCategoriesError] = React.useState('');
    const [listingCategoriesSaving, setListingCategoriesSaving] = React.useState(false);
    const [newsletterSubscribers, setNewsletterSubscribers] = React.useState([]);
    const [newsletterTotal, setNewsletterTotal] = React.useState(0);
    const [newsletterLoading, setNewsletterLoading] = React.useState(false);
    const [newsletterError, setNewsletterError] = React.useState('');

    const [communities, setCommunities] = React.useState([]);
    const [approvalCodes, setApprovalCodes] = React.useState([]);
    const [approvalStats, setApprovalStats] = React.useState({ total: 0, claimed: 0, unclaimed: 0, revoked: 0 });
    const [approvalLoading, setApprovalLoading] = React.useState(false);
    const [approvalError, setApprovalError] = React.useState('');
    const [approvalGenerating, setApprovalGenerating] = React.useState(false);
    const [approvalCommunityId, setApprovalCommunityId] = React.useState('');
    const [approvalSchoolCode, setApprovalSchoolCode] = React.useState('');
    const [approvalQuantity, setApprovalQuantity] = React.useState(50);
    const [approvalFilterCommunity, setApprovalFilterCommunity] = React.useState('all');
    const [approvalFilterStatus, setApprovalFilterStatus] = React.useState('all');

    const SCHOOL_CODES = {
      'Do Good Warehouse': 'DGW',
      'Ruby Bridges Elementary CC': 'RBE',
      'NEA/ACLC CC': 'NEA',
      'Academy of Alameda CC': 'AOA',
      'Island HS CC': 'IHS',
      'Encinal Jr Sr High School': 'ENC',
      'Madison Park Academy Primary': 'MPP',
      'Alameda Unified School District': 'AUS',
      'Markham Elementary': 'MKE',
      'Madison Park Academy': 'MPA',
      'McClymonds High School': 'MCH',
      'Hillside Elementary School': 'HES',
      'Edendale Middle School': 'EDS',
      'San Lorenzo High School': 'SLH',
      'Garfield Elementary': 'GFE',
      'Lodestar Charter School': 'LCS',
      'Horace Mann Elementary': 'HME',
    };

    const communityNameById = React.useMemo(() => {
      const map = {};
      (communities || []).forEach((c) => {
        if (c && c.id != null) map[String(c.id)] = c.name || `Community #${c.id}`;
      });
      return map;
    }, [communities]);

    const listingCategoryOptions = listingCategories.length
      ? listingCategories.filter((c) => c.is_active !== false).map((c) => ({ value: c.value, label: c.label }))
      : [
          { value: 'produce', label: 'Fresh Produce' },
          { value: 'prepared', label: 'Prepared Meals' },
          { value: 'packaged', label: 'Packaged Foods' },
          { value: 'bakery', label: 'Bakery Items' },
          { value: 'water', label: 'Water' },
          { value: 'fruit', label: 'Fruit' },
          { value: 'leftovers', label: 'Leftovers' },
        ];

    const normalizeListing = (listing) => ({
      id: listing.id,
      image_url: listing.image_url || (Array.isArray(listing.images) ? listing.images[0] : null),
      name: listing.name || listing.title || 'Untitled listing',
      description: listing.description || '',
      quantity: listing.quantity || (listing.qty != null ? `${listing.qty} ${listing.unit || ''}`.trim() : 'N/A'),
      location: listing.location || listing.address || 'Unknown',
      expiry_date: listing.expiry_date || listing.expiration_date,
      user_name: listing.user_name || listing.donor?.name || 'Unknown',
      status: listing.status || 'available',
      category: listing.category || '',
    });

    React.useEffect(() => {
      loadDatabaseStats();
      if (activeTab === 'centers') {
        loadCenters();
      } else if (activeTab === 'users') {
        loadUsers();
        loadCommunities();
      } else if (activeTab === 'approval_codes') {
        loadCommunities();
        loadApprovalCodes();
      } else if (activeTab === 'referrals') {
        loadReferralStats();
      } else if (activeTab === 'listings') {
        loadListings();
      } else if (activeTab === 'listing_approvals') {
        loadPendingApprovals();
        loadRequireListingApproval();
      } else if (activeTab === 'categories') {
        loadListingCategories();
      } else if (activeTab === 'newsletter') {
        loadNewsletterSubscribers();
      }
    }, [activeTab]);

    React.useEffect(() => {
      if (activeTab === 'users') {
        loadUsers();
      }
    }, [userRoleFilter]);

    React.useEffect(() => {
      if (!approvalCommunityId) {
        setApprovalSchoolCode('');
        return;
      }
      const community = communities.find((c) => String(c.id) === String(approvalCommunityId));
      if (community && SCHOOL_CODES[community.name]) {
        setApprovalSchoolCode(SCHOOL_CODES[community.name]);
      }
    }, [approvalCommunityId, communities]);

    React.useEffect(() => {
      if (activeTab === 'approval_codes') {
        loadApprovalCodes();
      }
    }, [approvalFilterCommunity, approvalFilterStatus]);

    React.useEffect(() => {
      if (activeTab !== 'ai_query') return;
      const mount = () => window.FoodMapsNouri?.mountQueryPanel('nouri-query-root');
      if (window.FoodMapsNouri?.mountWithRetry) {
        window.FoodMapsNouri.mountWithRetry(mount);
      } else {
        mount();
      }
    }, [activeTab]);

    const loadCenters = async () => {
      try {
        setCentersError('');
        const token = localStorage.getItem('auth_token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/centers', { headers });
        console.log('AdminPanel: Centers response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('AdminPanel: Loaded centers:', data);
          setCenters(data);
        } else {
          console.error('AdminPanel: Failed to load centers:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('AdminPanel: Error details:', errorData);
          setCentersError(errorData.detail || 'Failed to load centers');
        }
      } catch (error) {
        console.error('Error loading centers:', error);
        setCentersError('Failed to load centers');
      }
    };

    const handleSaveCenter = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const url = editingCenter ? `/api/centers/${editingCenter.id}` : '/api/centers';
        const method = editingCenter ? 'PUT' : 'POST';

        const types = parseCenterTypes(centerForm.provider_types);
        const socialApi = (typeof window !== 'undefined' && window.FoodMapsSocialMedia)
          ? window.FoodMapsSocialMedia
          : null;
        const social_media = socialApi
          ? socialApi.serializeSocialMedia({
              facebook: centerForm.social_facebook,
              instagram: centerForm.social_instagram,
              twitter: centerForm.social_twitter,
              youtube: centerForm.social_youtube,
              linkedin: centerForm.social_linkedin,
              tiktok: centerForm.social_tiktok,
            })
          : '';
        const payload = {
          ...centerForm,
          coords_lat: centerForm.coords_lat === '' || centerForm.coords_lat == null
            ? null
            : Number(centerForm.coords_lat),
          coords_lng: centerForm.coords_lng === '' || centerForm.coords_lng == null
            ? null
            : Number(centerForm.coords_lng),
          provider_types: JSON.stringify(types),
          logo_url: centerForm.logo_url || null,
          social_media: social_media || null,
        };
        delete payload.social_facebook;
        delete payload.social_instagram;
        delete payload.social_twitter;
        delete payload.social_youtube;
        delete payload.social_linkedin;
        delete payload.social_tiktok;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setShowCenterForm(false);
          setEditingCenter(null);
          setCenterForm({ ...emptyCenterForm });
          loadCenters();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to save center');
        }
      } catch (error) {
        console.error('Error saving center:', error);
        alert('Failed to save center');
      }
    };

    const handleUpdateCenterCategories = async (center, nextTypes) => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/centers/${center.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            provider_types: JSON.stringify(nextTypes || [])
          })
        });
        if (response.ok) {
          loadCenters();
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Failed to update categories');
        }
      } catch (error) {
        console.error('Error updating categories:', error);
        alert('Failed to update categories');
      }
    };

    const handleEditCenter = (center) => {
      const socialApi = (typeof window !== 'undefined' && window.FoodMapsSocialMedia)
        ? window.FoodMapsSocialMedia
        : null;
      const social = socialApi
        ? socialApi.parseSocialMedia(center.social_media)
        : {
            facebook: '', instagram: '', twitter: '',
            youtube: '', linkedin: '', tiktok: '',
          };
      setCenterForm({
        name: center.name || '',
        description: center.description || '',
        address: center.address || '',
        phone: center.phone || '',
        hours: center.hours || '',
        coords_lat: center.coords_lat || '',
        coords_lng: center.coords_lng || '',
        eligibility: center.eligibility || '',
        languages: center.languages || '',
        availability: center.availability || '',
        website: center.website || '',
        social_facebook: social.facebook || '',
        social_instagram: social.instagram || '',
        social_twitter: social.twitter || '',
        social_youtube: social.youtube || '',
        social_linkedin: social.linkedin || '',
        social_tiktok: social.tiktok || '',
        coverage_areas: center.coverage_areas || '',
        provider_types: center.provider_types
          ? (typeof center.provider_types === 'string'
              ? center.provider_types
              : JSON.stringify(center.provider_types))
          : '',
        logo_url: center.logo_url || ''
      });
      setEditingCenter(center);
      setShowCenterForm(true);
      setTimeout(() => {
        try {
          const el = document.getElementById('admin-center-form');
          if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (_) { /* ignore */ }
      }, 50);
    };

    const handleDeleteCenter = async (centerId) => {
      if (!confirm('Are you sure you want to delete this distribution center?')) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/centers/${centerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          loadCenters();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to delete center');
        }
      } catch (error) {
        console.error('Error deleting center:', error);
        alert('Failed to delete center');
      }
    };

    const loadReferralStats = async () => {
      setReferralLoading(true);
      try {
        setReferralsError('');
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/referrals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReferralStats(data);
        } else {
          const error = await response.json().catch(() => ({}));
          setReferralsError(error.detail || 'Failed to load referral analytics');
        }
      } catch (error) {
        console.error('Error loading referral stats:', error);
        setReferralsError('Failed to load referral analytics');
      } finally {
        setReferralLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        setUsersError('');
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (userRoleFilter && userRoleFilter !== 'all') {
          params.set('role', userRoleFilter);
        }
        const qs = params.toString();
        const response = await fetch(`/api/admin/users${qs ? `?${qs}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data.users) ? data.users : []);
          setUserCounts(data.counts || { all: 0, donor: 0, recipient: 0, admin: 0, driver: 0, volunteer: 0 });
        } else {
          const error = await response.json().catch(() => ({}));
          setUsersError(error.detail || 'Failed to load users');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setUsersError('Failed to load users');
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    const loadCommunities = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/communities', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCommunities(Array.isArray(data.communities) ? data.communities : []);
        }
      } catch (error) {
        console.error('Error loading communities:', error);
      }
    };

    const loadApprovalCodes = async () => {
      setApprovalLoading(true);
      try {
        setApprovalError('');
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (approvalFilterCommunity && approvalFilterCommunity !== 'all') {
          params.set('community_id', approvalFilterCommunity);
        }
        if (approvalFilterStatus && approvalFilterStatus !== 'all') {
          params.set('status', approvalFilterStatus);
        }
        const qs = params.toString();
        const response = await fetch(`/api/admin/approval-codes${qs ? `?${qs}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setApprovalCodes(Array.isArray(data.codes) ? data.codes : []);
          setApprovalStats(data.stats || { total: 0, claimed: 0, unclaimed: 0, revoked: 0 });
        } else {
          const error = await response.json().catch(() => ({}));
          setApprovalError(error.detail || 'Failed to load approval codes');
          setApprovalCodes([]);
        }
      } catch (error) {
        console.error('Error loading approval codes:', error);
        setApprovalError('Failed to load approval codes');
        setApprovalCodes([]);
      } finally {
        setApprovalLoading(false);
      }
    };

    const generateApprovalCodes = async () => {
      if (!approvalCommunityId || !/^[A-Z]{3}$/.test(String(approvalSchoolCode || '').toUpperCase())) {
        setApprovalError('Select a community and enter a 3-letter school code.');
        return;
      }
      const qty = Number(approvalQuantity);
      if (!Number.isFinite(qty) || qty < 1 || qty > 1000) {
        setApprovalError('Quantity must be between 1 and 1000.');
        return;
      }
      setApprovalGenerating(true);
      setApprovalError('');
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/approval-codes', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            community_id: Number(approvalCommunityId),
            school_code: String(approvalSchoolCode).toUpperCase(),
            quantity: qty,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setApprovalError(data.detail || 'Failed to generate codes');
          return;
        }
        await loadApprovalCodes();
      } catch (error) {
        console.error('Error generating approval codes:', error);
        setApprovalError('Failed to generate codes');
      } finally {
        setApprovalGenerating(false);
      }
    };

    const exportApprovalCodes = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (approvalFilterCommunity && approvalFilterCommunity !== 'all') {
          params.set('community_id', approvalFilterCommunity);
        }
        const qs = params.toString();
        const response = await fetch(`/api/admin/approval-codes/export${qs ? `?${qs}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setApprovalError('Failed to export codes');
          return;
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'foodmaps-approval-codes.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting approval codes:', error);
        setApprovalError('Failed to export codes');
      }
    };

    const revokeApprovalCode = async (codeId) => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/admin/approval-codes/${codeId}/revoke`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          setApprovalError(error.detail || 'Failed to revoke code');
          return;
        }
        await loadApprovalCodes();
      } catch (error) {
        console.error('Error revoking approval code:', error);
        setApprovalError('Failed to revoke code');
      }
    };

    const assignUserCommunity = async (userId, communityId) => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/admin/users/${userId}/community`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            community_id: communityId === '' || communityId == null ? null : Number(communityId),
          }),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          setUsersError(error.detail || 'Failed to update community');
          return;
        }
        await loadUsers();
      } catch (error) {
        console.error('Error assigning community:', error);
        setUsersError('Failed to update community');
      }
    };

    const loadPendingApprovals = async () => {
      setPendingApprovalsLoading(true);
      try {
        setPendingApprovalsError('');
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/listings/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const rows = Array.isArray(data.listings) ? data.listings.map(normalizeListing) : [];
          setPendingApprovals(rows);
          setPendingCount(typeof data.count === 'number' ? data.count : rows.length);
          setSelectedPendingIds([]);
        } else {
          const error = await response.json().catch(() => ({}));
          setPendingApprovalsError(error.detail || 'Failed to load pending listings');
        }
      } catch (error) {
        console.error('Error loading pending approvals:', error);
        setPendingApprovalsError('Failed to load pending listings');
      } finally {
        setPendingApprovalsLoading(false);
      }
    };

    const loadRequireListingApproval = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/settings/require_listing_approval', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRequireListingApproval(!!data.value);
        }
      } catch (error) {
        console.error('Error loading approval setting:', error);
      }
    };

    const handleToggleRequireListingApproval = async () => {
      const next = !requireListingApproval;
      setSavingApprovalToggle(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/settings/require_listing_approval', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: next }),
        });
        if (response.ok) {
          const data = await response.json();
          setRequireListingApproval(!!data.value);
          if (typeof window.showAlert === 'function') {
            window.showAlert(data.message || (next ? 'Approval required' : 'Go live immediately'), {
              title: 'Setting updated',
              variant: 'success',
            });
          } else {
            alert(data.message || 'Setting updated');
          }
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Failed to update setting');
        }
      } catch (error) {
        console.error('Toggle require approval failed:', error);
        alert('Failed to update setting');
      } finally {
        setSavingApprovalToggle(false);
      }
    };

    const handleReviewListing = async (listingId, approve) => {
      setApprovalBusyId(listingId);
      try {
        const token = localStorage.getItem('auth_token');
        const action = approve ? 'approve' : 'decline';
        const response = await fetch(`/api/admin/listings/${listingId}/${action}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setPendingApprovals((prev) => prev.filter((l) => l.id !== listingId));
          setPendingCount((c) => Math.max(0, c - 1));
          setSelectedPendingIds((prev) => prev.filter((id) => id !== listingId));
          try {
            window.dispatchEvent(new CustomEvent('listingUpdated', { detail: { id: listingId } }));
          } catch (_) { /* ignore */ }
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || `Failed to ${action} listing`);
        }
      } catch (error) {
        console.error('Listing review failed:', error);
        alert('Failed to update listing');
      } finally {
        setApprovalBusyId(null);
      }
    };

    const handleBulkReviewListings = async (approve) => {
      const ids = (selectedPendingIds.length ? selectedPendingIds : pendingApprovals.map((l) => l.id)).filter(Boolean);
      if (!ids.length) return;
      const action = approve ? 'approve' : 'decline';
      if (!confirm(`${approve ? 'Approve' : 'Decline'} ${ids.length} listing${ids.length === 1 ? '' : 's'}?`)) {
        return;
      }
      setApprovalBulkBusy(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/listings/bulk-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids, action }),
        });
        if (response.ok) {
          const data = await response.json();
          const okIds = new Set(data.succeeded || []);
          setPendingApprovals((prev) => prev.filter((l) => !okIds.has(l.id)));
          setPendingCount((c) => Math.max(0, c - okIds.size));
          setSelectedPendingIds([]);
          try {
            window.dispatchEvent(new CustomEvent('listingsChanged'));
          } catch (_) { /* ignore */ }
          if (data.failed && data.failed.length) {
            alert(`${data.failed.length} listing(s) could not be updated`);
          }
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Bulk review failed');
        }
      } catch (error) {
        console.error('Bulk review failed:', error);
        alert('Bulk review failed');
      } finally {
        setApprovalBulkBusy(false);
      }
    };

    const togglePendingSelection = (id) => {
      setSelectedPendingIds((prev) => (
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ));
    };

    const loadListings = async () => {
      setListingsLoading(true);
      try {
        setListingsError('');
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/listings/get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setListings(Array.isArray(data) ? data.map(normalizeListing) : []);
        } else {
          const error = await response.json().catch(() => ({}));
          setListingsError(error.detail || 'Failed to load listings');
        }
      } catch (error) {
        console.error('Error loading listings:', error);
        setListingsError('Failed to load listings');
      } finally {
        setListingsLoading(false);
      }
    };

    const handleDeleteListing = async (listingId) => {
      if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/listings/get/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Listing deleted successfully');
          // Notify the main app so React state and the map refresh too.
          try {
            window.dispatchEvent(new CustomEvent('listingDeleted', { detail: { id: listingId } }));
          } catch (e) { /* ignore */ }
          loadListings();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to delete listing');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      }
    };

    const handleUpdateListingCategory = async (listing, nextCategory) => {
      if (!listing?.id || !nextCategory || nextCategory === listing.category) return;
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/listings/get/${listing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ category: nextCategory }),
        });
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const next = (data.listing && data.listing.category) || nextCategory;
          setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, category: next } : l)));
          try {
            window.dispatchEvent(new CustomEvent('listingUpdated', {
              detail: data.listing || { id: listing.id, category: next },
            }));
          } catch (_) { /* ignore */ }
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Failed to update category');
        }
      } catch (error) {
        console.error('Error updating listing category:', error);
        alert('Failed to update category');
      }
    };

    const loadListingCategories = async () => {
      setListingCategoriesLoading(true);
      setListingCategoriesError('');
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data.categories) ? data.categories : [];
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setListingCategories(list);
        } else {
          const error = await response.json().catch(() => ({}));
          setListingCategoriesError(error.detail || 'Failed to load categories');
        }
      } catch (error) {
        console.error('Error loading listing categories:', error);
        setListingCategoriesError('Failed to load categories');
      } finally {
        setListingCategoriesLoading(false);
      }
    };

    const loadNewsletterSubscribers = async () => {
      setNewsletterLoading(true);
      setNewsletterError('');
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/newsletter/subscribers?active_only=true&limit=500', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNewsletterSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
          setNewsletterTotal(Number(data.total) || 0);
        } else {
          const error = await response.json().catch(() => ({}));
          setNewsletterError(error.detail || 'Failed to load subscribers');
        }
      } catch (error) {
        console.error('Error loading newsletter subscribers:', error);
        setNewsletterError('Failed to load subscribers');
      } finally {
        setNewsletterLoading(false);
      }
    };

    const deactivateNewsletterSubscriber = async (id) => {
      if (!window.confirm('Remove this email from the active newsletter list?')) return;
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/newsletter/subscribers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          await loadNewsletterSubscribers();
        } else {
          const error = await response.json().catch(() => ({}));
          setNewsletterError(error.detail || 'Failed to remove subscriber');
        }
      } catch (error) {
        console.error('Error deactivating subscriber:', error);
        setNewsletterError('Failed to remove subscriber');
      }
    };

    const downloadCsv = (filenamePrefix, headers, rows) => {
      const allRows = [headers, ...rows];
      const csv = allRows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foodmaps-${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const filteredUsersForExport = () => {
      const needle = userSearch.trim().toLowerCase();
      return users.filter((u) => {
        if (!needle) return true;
        const hay = [
          u.name, u.email, u.phone, u.role, u.referral_code, u.address, u.referred_by_code,
        ].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(needle);
      });
    };

    const exportUsersCsv = () => {
      const rows = filteredUsersForExport().map((u) => [
        u.id ?? '',
        u.name || '',
        u.email || '',
        u.role || '',
        u.phone || '',
        (u.community_id != null ? (communityNameById[String(u.community_id)] || '') : ''),
        u.approval_number || '',
        u.referral_code || '',
        u.referred_by_code || '',
        u.address || '',
        u.created_at || '',
      ]);
      downloadCsv('users', [
        'id', 'name', 'email', 'role', 'phone', 'community', 'approval_number',
        'referral_code', 'referred_by_code', 'address', 'joined',
      ], rows);
    };

    const exportCentersCsv = () => {
      const socialApi = (typeof window !== 'undefined' && window.FoodMapsSocialMedia)
        ? window.FoodMapsSocialMedia
        : null;
      const rows = centers.map((c) => {
        const social = socialApi
          ? socialApi.parseSocialMedia(c.social_media)
          : (typeof c.social_media === 'object' && c.social_media ? c.social_media : {});
        const types = Array.isArray(c.provider_types)
          ? c.provider_types.join('; ')
          : (typeof c.provider_types === 'string' ? c.provider_types : '');
        return [
          c.id ?? '',
          c.name || '',
          c.description || '',
          c.address || '',
          c.phone || '',
          c.hours || '',
          c.coords_lat ?? '',
          c.coords_lng ?? '',
          c.eligibility || '',
          c.languages || '',
          c.availability || '',
          c.website || '',
          social.facebook || '',
          social.instagram || '',
          social.twitter || '',
          social.youtube || '',
          social.linkedin || '',
          social.tiktok || '',
          c.coverage_areas || '',
          types,
          c.is_active ? 'active' : 'inactive',
        ];
      });
      downloadCsv('distribution-centers', [
        'id', 'name', 'description', 'address', 'phone', 'hours',
        'lat', 'lng', 'eligibility', 'languages', 'availability', 'website',
        'facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok',
        'coverage_areas', 'provider_types', 'status',
      ], rows);
    };

    const exportListingsCsv = () => {
      const rows = listings.map((l) => [
        l.id ?? '',
        l.name || '',
        l.description || '',
        l.quantity || '',
        l.location || '',
        l.category || '',
        l.status || '',
        l.user_name || '',
        l.expiry_date || '',
        l.image_url || '',
      ]);
      downloadCsv('listings', [
        'id', 'name', 'description', 'quantity', 'location', 'category',
        'status', 'posted_by', 'expires', 'image_url',
      ], rows);
    };

    const exportReferralsCsv = () => {
      const edgeRows = [];
      referralStats.forEach((referrer) => {
        const referred = Array.isArray(referrer.referred_users) ? referrer.referred_users : [];
        if (!referred.length) {
          edgeRows.push([
            referrer.id ?? '',
            referrer.name || '',
            referrer.email || '',
            referrer.referral_code || '',
            referrer.referral_count ?? 0,
            referrer.created_at || '',
            '',
            '',
            '',
            '',
          ]);
          return;
        }
        referred.forEach((r) => {
          edgeRows.push([
            referrer.id ?? '',
            referrer.name || '',
            referrer.email || '',
            referrer.referral_code || '',
            referrer.referral_count ?? 0,
            referrer.created_at || '',
            r.id ?? '',
            r.name || '',
            r.email || '',
            r.created_at || '',
          ]);
        });
      });
      downloadCsv('referrals', [
        'referrer_id', 'referrer_name', 'referrer_email', 'referral_code',
        'referral_count', 'referrer_joined',
        'referred_id', 'referred_name', 'referred_email', 'referred_joined',
      ], edgeRows);
    };

    const exportNewsletterCsv = () => {
      downloadCsv('newsletter', [
        'email', 'first_name', 'last_name', 'source', 'subscribed_at',
      ], newsletterSubscribers.map((s) => [
        s.email || '',
        s.first_name || '',
        s.last_name || '',
        s.source || '',
        s.created_at || '',
      ]));
    };

    const updateListingCategoryField = (id, patch) => {
      setListingCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    };

    const moveListingCategory = (id, direction) => {
      setListingCategories((prev) => {
        const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const idx = sorted.findIndex((c) => c.id === id);
        if (idx < 0) return prev;
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= sorted.length) return prev;
        const a = sorted[idx];
        const b = sorted[swapWith];
        const aOrder = a.sort_order;
        sorted[idx] = { ...a, sort_order: b.sort_order };
        sorted[swapWith] = { ...b, sort_order: aOrder };
        return sorted.sort((x, y) => (x.sort_order || 0) - (y.sort_order || 0));
      });
    };

    const saveListingCategories = async () => {
      setListingCategoriesSaving(true);
      setListingCategoriesError('');
      try {
        const token = localStorage.getItem('auth_token');
        const payload = {
          categories: listingCategories.map((c, i) => ({
            id: c.id,
            label: c.label,
            is_active: c.is_active,
            sort_order: c.sort_order != null ? c.sort_order : i + 1,
          })),
        };
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data.categories) ? data.categories : [];
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setListingCategories(list);
          window.LISTING_CATEGORIES = list
            .filter((c) => c.is_active !== false)
            .map((c) => ({ value: c.value, label: c.label }));
          try {
            window.dispatchEvent(new CustomEvent('listingCategoriesUpdated', {
              detail: { categories: window.LISTING_CATEGORIES },
            }));
          } catch (_) { /* ignore */ }
          alert('Categories saved. The main page filter list will update on refresh.');
        } else {
          const error = await response.json().catch(() => ({}));
          setListingCategoriesError(error.detail || 'Failed to save categories');
        }
      } catch (error) {
        console.error('Error saving listing categories:', error);
        setListingCategoriesError('Failed to save categories');
      } finally {
        setListingCategoriesSaving(false);
      }
    };

    const loadDatabaseStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const statsResp = await fetch('/api/admin/stats', { headers });
        if (statsResp.ok) {
          const stats = await statsResp.json();
          setDbStats({
            users: stats.users || 0,
            listings: stats.listings || 0,
            schedules: stats.schedules || 0,
            tasks: stats.tasks || 0,
            pending_listings: stats.pending_listings || 0,
            connected: stats.connected !== false
          });
          setPendingCount(stats.pending_listings || 0);
          return;
        }

        // Fallback for non-admin sessions: show what we can and mark disconnected.
        const [listingsResp, centersResp] = await Promise.all([
          fetch('/api/listings/get?limit=500', { headers }),
          fetch('/api/centers', { headers })
        ]);

        const listingsData = listingsResp.ok ? await listingsResp.json() : [];
        const centersData = centersResp.ok ? await centersResp.json() : [];

        setDbStats({
          users: 0,
          listings: Array.isArray(listingsData) ? listingsData.length : 0,
          schedules: 0,
          tasks: Array.isArray(centersData) ? centersData.filter(c => c.is_active).length : 0,
          connected: false
        });
      } catch (error) {
        console.error('Error loading database stats:', error);
        setDbStats({ users: 0, listings: 0, schedules: 0, tasks: 0, connected: false });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-5"
        data-name="admin-panel" data-file="js/components/admin/AdminPanel.js">
        <div className="bg-white rounded-lg w-[min(96vw,1100px)] max-h-[90dvh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          <div className="px-4 pb-4 sm:px-6 sm:pb-6 overflow-y-auto overflow-x-hidden min-w-0">

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'users', label: 'Users', icon: 'users' },
                { id: 'approval_codes', label: 'Approval Codes', icon: 'key' },
                { id: 'centers', label: 'Distribution Centers', icon: 'map-pin' },
                { id: 'listing_approvals', label: pendingCount > 0 ? `Listing Approvals (${pendingCount})` : 'Listing Approvals', icon: 'check-circle' },
                { id: 'listings', label: 'Listings', icon: 'package' },
                { id: 'categories', label: 'Categories', icon: 'tags' },
                { id: 'referrals', label: 'Referrals', icon: 'user-plus' },
                { id: 'feedback', label: 'Feedback', icon: 'message-square' },
                { id: 'newsletter', label: 'Newsletter', icon: 'mail' },
                { id: 'messages', label: 'Messages', icon: 'message-circle' },
                { id: 'ai_broadcasts', label: 'AI Broadcasts', icon: 'megaphone' },
                { id: 'ai_query', label: 'AI Query', icon: 'search' },
                { id: 'database', label: 'Database', icon: 'database' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className={`icon-${tab.icon} mr-2`}></div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-users text-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{dbStats.users}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-package text-green-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Food Listings</p>
                    <p className="text-2xl font-bold text-green-600">{dbStats.listings}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-orange-50 border-orange-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-calendar text-orange-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Schedules</p>
                    <p className="text-2xl font-bold text-orange-600">{dbStats.schedules}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-list-checks text-purple-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">{dbStats.tasks}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'centers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-lg font-semibold">Distribution Centers</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportCentersCsv}
                    disabled={!centers.length}
                    className="btn-secondary flex items-center disabled:opacity-50"
                  >
                    <div className="icon-download mr-2"></div>
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      setCenterForm({ ...emptyCenterForm });
                      setEditingCenter(null);
                      setShowCenterForm(true);
                    }}
                    className="btn-primary flex items-center"
                  >
                    <div className="icon-plus mr-2"></div>
                    Add Center
                  </button>
                </div>
              </div>

              {showCenterForm && (
                <div className="card" id="admin-center-form">
                  <h4 className="text-md font-semibold mb-4">
                    {editingCenter ? 'Edit Distribution Center' : 'Add New Distribution Center'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Center Name"
                      value={centerForm.name}
                      onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={centerForm.phone}
                      onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                      className={inputClass}
                    />
                    <textarea
                      placeholder="Description"
                      value={centerForm.description}
                      onChange={(e) => setCenterForm({ ...centerForm, description: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows="2"
                    ></textarea>
                    <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50/50 p-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Social media links</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Add full URLs. These show as clickable icons on map pins and provider cards.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'social_facebook', label: 'Facebook', icon: 'fab fa-facebook', placeholder: 'https://facebook.com/...' },
                          { key: 'social_instagram', label: 'Instagram', icon: 'fab fa-instagram', placeholder: 'https://instagram.com/...' },
                          { key: 'social_twitter', label: 'X / Twitter', icon: 'fab fa-x-twitter', placeholder: 'https://x.com/...' },
                          { key: 'social_youtube', label: 'YouTube', icon: 'fab fa-youtube', placeholder: 'https://youtube.com/...' },
                          { key: 'social_linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin', placeholder: 'https://linkedin.com/...' },
                          { key: 'social_tiktok', label: 'TikTok', icon: 'fab fa-tiktok', placeholder: 'https://tiktok.com/@...' },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <i className={`${field.icon} mr-1.5 text-green-700`} aria-hidden="true"></i>
                              {field.label}
                            </label>
                            <input
                              type="url"
                              placeholder={field.placeholder}
                              value={centerForm[field.key] || ''}
                              onChange={(e) => setCenterForm({ ...centerForm, [field.key]: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const socialApi = (typeof window !== 'undefined' && window.FoodMapsSocialMedia)
                          ? window.FoodMapsSocialMedia
                          : null;
                        if (!socialApi) return null;
                        const previewCenter = {
                          website: centerForm.website,
                          social_media: socialApi.serializeSocialMedia({
                            facebook: centerForm.social_facebook,
                            instagram: centerForm.social_instagram,
                            twitter: centerForm.social_twitter,
                            youtube: centerForm.social_youtube,
                            linkedin: centerForm.social_linkedin,
                            tiktok: centerForm.social_tiktok,
                          }),
                        };
                        const items = socialApi.socialLinkItems(previewCenter);
                        if (!items.length) return null;
                        return (
                          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-green-200">
                            <span className="text-xs font-medium text-gray-600">Preview:</span>
                            {items.map((item) => (
                              <a
                                key={item.network}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={item.label}
                                title={item.label}
                                className="text-green-700 hover:text-green-900 text-lg leading-none"
                              >
                                <i className={item.iconClass} aria-hidden="true"></i>
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={centerForm.address}
                      onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                    />
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={centerForm.coords_lat}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lat: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={centerForm.coords_lng}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lng: e.target.value })}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!centerForm.address) {
                            alert('Please enter an address first');
                            return;
                          }
                          try {
                            const mapboxToken = window.MAPBOX_ACCESS_TOKEN;
                            if (!mapboxToken) {
                              alert('Mapbox token not configured');
                              return;
                            }
                            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(centerForm.address)}.json?access_token=${encodeURIComponent(mapboxToken)}&limit=1`);
                            const data = await response.json();
                            if (data.features && data.features[0]) {
                              const [lng, lat] = data.features[0].center;
                              setCenterForm({ ...centerForm, coords_lat: lat, coords_lng: lng });
                              alert('Coordinates found!');
                            } else {
                              alert('Could not find coordinates for this address');
                            }
                          } catch (error) {
                            console.error('Geocoding error:', error);
                            alert('Failed to geocode address');
                          }
                        }}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <div className="icon-map-pin mr-1"></div>
                        Geocode
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Operating Hours (e.g., Mon-Fri 9AM-5PM)"
                      value={centerForm.hours}
                      onChange={(e) => setCenterForm({ ...centerForm, hours: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                    />

                    <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-green-900">Categories</h5>
                        <p className="text-xs text-green-800 mt-1">
                          Select all provider types that apply. These power filters on the Providers page.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {providerTypeOptions.map((tag) => {
                          const on = selectedProviderTypes.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleProviderType(tag)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                on
                                  ? (typeof window.getProviderTypeClasses === 'function'
                                      ? window.getProviderTypeClasses(tag, 'selected')
                                      : 'bg-green-700 text-white border-green-700')
                                  : (typeof window.getProviderTypeClasses === 'function'
                                      ? window.getProviderTypeClasses(tag, 'idle')
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-600')
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                      {selectedProviderTypes.length > 0 && (
                        <p className="text-xs text-green-800">
                          Selected: {selectedProviderTypes.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-amber-900">Additional location details</h5>
                        <p className="text-xs text-amber-800 mt-1">
                          Optional fields shown on the map location card.
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                          type="text"
                          placeholder="/assets/logos/AGLfoundationLOGO.png or https://..."
                          value={centerForm.logo_url || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, logo_url: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                        <select
                          value={centerForm.availability || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, availability: e.target.value })}
                          className={inputClass}
                        >
                          {availabilityOptions.map((opt) => (
                            <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Eligibility</label>
                        <textarea
                          placeholder="Who can receive food, ID requirements, etc."
                          value={centerForm.eligibility || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, eligibility: e.target.value })}
                          className={inputClass}
                          rows="2"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Languages spoken on-site</label>
                        <input
                          type="text"
                          placeholder="e.g., English, Spanish"
                          value={centerForm.languages || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, languages: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Coverage areas</label>
                        <textarea
                          placeholder="Neighborhoods / areas served"
                          value={centerForm.coverage_areas || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, coverage_areas: e.target.value })}
                          className={inputClass}
                          rows="2"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={centerForm.website || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, website: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setShowCenterForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCenter}
                      className="btn-primary"
                    >
                      {editingCenter ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {centersError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{centersError}</div>
                )}
                {centers.map(center => {
                  const centerTypes = parseCenterTypes(center.provider_types);
                  return (
                  <div key={center.id} className="card">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg">{center.name}</h4>
                        <p className="text-gray-600 mb-2">{center.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Address:</strong> {center.address}</p>
                          <p><strong>Phone:</strong> {center.phone || '—'}</p>
                          <p><strong>Hours:</strong> {center.hours || '—'}</p>
                          <p><strong>Status:</strong>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${center.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {center.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>

                        <div className="mt-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Categories</p>
                            <span className="text-xs text-green-700">{centerTypes.length} selected</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {providerTypeOptions.map((tag) => {
                              const on = centerTypes.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  title={on ? `Remove ${tag}` : `Add ${tag}`}
                                  onClick={() => {
                                    const next = on
                                      ? centerTypes.filter((t) => t !== tag)
                                      : [...centerTypes, tag];
                                    handleUpdateCenterCategories(center, next);
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                    on
                                      ? (typeof window.getProviderTypeClasses === 'function'
                                          ? window.getProviderTypeClasses(tag, 'selected')
                                          : 'bg-green-700 text-white border-green-700')
                                      : (typeof window.getProviderTypeClasses === 'function'
                                          ? window.getProviderTypeClasses(tag, 'idle')
                                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-600')
                                  }`}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {(() => {
                          const Details = window.DistributionCenterDetails;
                          return typeof Details === 'function'
                            ? <Details center={center} compact={true} showCategories={false} />
                            : null;
                        })()}
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 shrink-0">
                        {(() => {
                          const ShareBtn = window.DistributionCenterShareButton;
                          return typeof ShareBtn === 'function'
                            ? <ShareBtn center={center} />
                            : null;
                        })()}
                        <button
                          onClick={() => handleEditCenter(center)}
                          className="btn-secondary text-sm"
                        >
                          <div className="icon-edit mr-1"></div>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCenter(center.id)}
                          className="btn-danger text-sm"
                        >
                          <div className="icon-trash mr-1"></div>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
                {centers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No distribution centers found. Add one to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">All Users</h3>
                <div className="flex flex-wrap gap-2 self-start">
                  <button
                    type="button"
                    onClick={exportUsersCsv}
                    disabled={!users.length}
                    className="btn-secondary flex items-center disabled:opacity-50"
                  >
                    <div className="icon-download mr-2"></div>
                    Export CSV
                  </button>
                  <button
                    onClick={loadUsers}
                    className="btn-secondary flex items-center"
                  >
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'all', label: 'All', active: 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' },
                  { key: 'donor', label: 'Donors', active: 'bg-green-50 border-green-400 ring-1 ring-green-300' },
                  { key: 'recipient', label: 'Recipients', active: 'bg-orange-50 border-orange-400 ring-1 ring-orange-300' },
                  { key: 'admin', label: 'Admins', active: 'bg-purple-50 border-purple-400 ring-1 ring-purple-300' },
                ].map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setUserRoleFilter(card.key)}
                    className={`card text-left border ${
                      userRoleFilter === card.key
                        ? card.active
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {userCounts[card.key] ?? 0}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, or referral code…"
                  className={inputClass + ' sm:flex-1'}
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className={inputClass + ' sm:w-48'}
                >
                  <option value="all">All roles</option>
                  <option value="donor">Donors</option>
                  <option value="recipient">Recipients</option>
                  <option value="admin">Admins</option>
                  <option value="driver">Drivers</option>
                  <option value="volunteer">Volunteers</option>
                </select>
              </div>

              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  {usersError && (
                    <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{usersError}</div>
                  )}
                  {(() => {
                    const needle = userSearch.trim().toLowerCase();
                    const visible = users.filter((u) => {
                      if (!needle) return true;
                      const hay = [
                        u.name, u.email, u.phone, u.role, u.referral_code, u.address, u.referred_by_code
                      ].filter(Boolean).join(' ').toLowerCase();
                      return hay.includes(needle);
                    });
                    return (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          Showing <strong className="text-gray-900">{visible.length}</strong> user{visible.length === 1 ? '' : 's'}
                          {userRoleFilter !== 'all' ? ` (${userRoleFilter}s)` : ''}
                        </p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-gray-600">
                              <th className="py-2 pr-3">Name</th>
                              <th className="py-2 pr-3">Email</th>
                              <th className="py-2 pr-3">Role</th>
                              <th className="py-2 pr-3">Phone</th>
                              <th className="py-2 pr-3">Community</th>
                              <th className="py-2 pr-3">Referral code</th>
                              <th className="py-2 pr-3">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visible.map((user) => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-2.5 pr-3 font-medium text-gray-900">{user.name || '—'}</td>
                                <td className="py-2.5 pr-3 text-gray-700">{user.email || '—'}</td>
                                <td className="py-2.5 pr-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                    user.role === 'donor' ? 'bg-green-100 text-green-800' :
                                    user.role === 'recipient' ? 'bg-orange-100 text-orange-800' :
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {user.role || 'unknown'}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-3 text-gray-700">{user.phone || '—'}</td>
                                <td className="py-2.5 pr-3 min-w-[10rem]">
                                  <select
                                    className={inputClass + ' text-xs py-1'}
                                    value={user.community_id != null ? String(user.community_id) : ''}
                                    onChange={(e) => assignUserCommunity(user.id, e.target.value)}
                                  >
                                    <option value="">Unassigned</option>
                                    {communities.map((c) => (
                                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                                    ))}
                                  </select>
                                  {user.approval_number && (
                                    <div className="text-[10px] text-gray-500 mt-0.5 font-mono">{user.approval_number}</div>
                                  )}
                                </td>
                                <td className="py-2.5 pr-3">
                                  {user.referral_code ? (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.referral_code}</code>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">
                                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {visible.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            No users match these filters.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approval_codes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">Approval Codes</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={exportApprovalCodes} className="btn-secondary flex items-center">
                    Export CSV
                  </button>
                  <button type="button" onClick={loadApprovalCodes} className="btn-secondary flex items-center">
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                </div>
              </div>

              {approvalError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{approvalError}</div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: approvalStats.total },
                  { label: 'Unclaimed', value: approvalStats.unclaimed },
                  { label: 'Claimed', value: approvalStats.claimed },
                  { label: 'Revoked', value: approvalStats.revoked },
                ].map((s) => (
                  <div key={s.label} className="card">
                    <p className="text-sm text-gray-600">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value ?? 0}</p>
                  </div>
                ))}
              </div>

              <div className="card space-y-3">
                <h4 className="font-semibold text-gray-900">Generate codes</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    className={inputClass}
                    value={approvalCommunityId}
                    onChange={(e) => setApprovalCommunityId(e.target.value)}
                  >
                    <option value="">Select community…</option>
                    {communities.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    maxLength={3}
                    value={approvalSchoolCode}
                    onChange={(e) => setApprovalSchoolCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))}
                    placeholder="School code (e.g. RBE)"
                  />
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    className={inputClass}
                    value={approvalQuantity}
                    onChange={(e) => setApprovalQuantity(e.target.value)}
                    placeholder="Quantity"
                  />
                  <button
                    type="button"
                    className="btn-primary disabled:opacity-50"
                    disabled={approvalGenerating}
                    onClick={generateApprovalCodes}
                  >
                    {approvalGenerating ? 'Generating…' : 'Generate'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Codes use a 3-letter school prefix plus 6 digits (example: RBE123456). Each code can be claimed once at signup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className={inputClass + ' sm:w-64'}
                  value={approvalFilterCommunity}
                  onChange={(e) => setApprovalFilterCommunity(e.target.value)}
                >
                  <option value="all">All communities</option>
                  {communities.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                <select
                  className={inputClass + ' sm:w-48'}
                  value={approvalFilterStatus}
                  onChange={(e) => setApprovalFilterStatus(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="unclaimed">Unclaimed</option>
                  <option value="claimed">Claimed</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              {approvalLoading ? (
                <div className="text-center py-8 text-gray-500">Loading approval codes…</div>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-600">
                        <th className="py-2 pr-3">Code</th>
                        <th className="py-2 pr-3">Community</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Created</th>
                        <th className="py-2 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvalCodes.slice(0, 200).map((row) => {
                        const status = row.is_revoked ? 'revoked' : row.is_claimed ? 'claimed' : 'unclaimed';
                        return (
                          <tr key={row.id} className="border-b hover:bg-gray-50">
                            <td className="py-2.5 pr-3 font-mono text-xs">{row.code}</td>
                            <td className="py-2.5 pr-3">
                              {communityNameById[String(row.community_id)] || `#${row.community_id}`}
                            </td>
                            <td className="py-2.5 pr-3 capitalize">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                status === 'unclaimed' ? 'bg-green-100 text-green-800' :
                                status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>{status}</span>
                            </td>
                            <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">
                              {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-2.5 pr-3">
                              {status === 'unclaimed' ? (
                                <button
                                  type="button"
                                  className="text-xs text-red-600 hover:underline"
                                  onClick={() => revokeApprovalCode(row.id)}
                                >
                                  Revoke
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {approvalCodes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No approval codes match these filters.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-lg font-semibold">Referral Analytics</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportReferralsCsv}
                    disabled={!referralStats.length}
                    className="btn-secondary flex items-center disabled:opacity-50"
                  >
                    <div className="icon-download mr-2"></div>
                    Export CSV
                  </button>
                  <button
                    onClick={loadReferralStats}
                    className="btn-secondary flex items-center"
                  >
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                </div>
              </div>

              {referralLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading referral data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referralsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{referralsError}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-blue-50 border-blue-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-users text-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Referrers</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {referralStats.filter(r => r.referral_count > 0).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-green-50 border-green-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-user-plus text-green-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Referrals</p>
                          <p className="text-2xl font-bold text-green-600">
                            {referralStats.reduce((sum, r) => sum + r.referral_count, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-purple-50 border-purple-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-trending-up text-purple-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg per Referrer</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {referralStats.length > 0 ?
                              Math.round(referralStats.reduce((sum, r) => sum + r.referral_count, 0) / referralStats.filter(r => r.referral_count > 0).length * 10) / 10 || 0
                              : 0
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4">Top Referrers</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">User</th>
                            <th className="text-left py-2">Email</th>
                            <th className="text-left py-2">Referral Code</th>
                            <th className="text-right py-2">Referrals</th>
                            <th className="text-left py-2">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralStats
                            .sort((a, b) => b.referral_count - a.referral_count)
                            .slice(0, 10)
                            .map(user => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 font-medium">{user.name}</td>
                                <td className="py-2 text-gray-600">{user.email}</td>
                                <td className="py-2">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {user.referral_code}
                                  </code>
                                </td>
                                <td className="py-2 text-right">
                                  <span className={`px-2 py-1 rounded-full text-sm ${user.referral_count > 5 ? 'bg-green-100 text-green-800' :
                                    user.referral_count > 2 ? 'bg-blue-100 text-blue-800' :
                                      user.referral_count > 0 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.referral_count}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-600 text-sm">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {referralStats.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No referral data available yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4">Recent Referrals</h4>
                    <div className="space-y-2">
                      {referralStats
                        .filter(user => user.referred_users && user.referred_users.length > 0)
                        .slice(0, 5)
                        .map(referrer =>
                          referrer.referred_users.map(referred => (
                            <div key={`${referrer.id}-${referred.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{referred.name}</span>
                                <span className="text-gray-600 ml-2">({referred.email})</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Referred by <span className="font-medium">{referrer.name}</span>
                                <span className="ml-2">{new Date(referred.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      {referralStats.filter(u => u.referred_users && u.referred_users.length > 0).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No recent referrals to display.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listing_approvals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Listing Approvals</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Review donation listings from donors and Nouri before they appear on Find Food.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Require approval</p>
                    <p className="text-xs text-gray-500">
                      {requireListingApproval
                        ? 'Donations start as pending'
                        : 'Donations go live immediately'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={requireListingApproval}
                    disabled={savingApprovalToggle}
                    onClick={handleToggleRequireListingApproval}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
                      requireListingApproval ? 'bg-green-600' : 'bg-gray-300'
                    } ${savingApprovalToggle ? 'opacity-60' : ''}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition mt-0.5 ${
                        requireListingApproval ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</p>
                  <p className="mt-1 text-2xl font-bold text-amber-900">{pendingApprovals.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    Admin-created listings always go live. Turning off require-approval only affects new donor/Nouri posts — it does not auto-approve this queue.
                  </p>
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={loadPendingApprovals}
                      className="btn-secondary text-sm"
                      disabled={pendingApprovalsLoading}
                    >
                      Refresh
                    </button>
                    {pendingApprovals.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn-primary text-sm"
                          disabled={approvalBulkBusy || approvalBusyId != null}
                          onClick={() => handleBulkReviewListings(true)}
                        >
                          {approvalBulkBusy ? 'Working…' : 'Approve all'}
                        </button>
                        <button
                          type="button"
                          className="btn-danger text-sm"
                          disabled={approvalBulkBusy || approvalBusyId != null}
                          onClick={() => handleBulkReviewListings(false)}
                        >
                          Decline all
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {pendingApprovalsLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading pending listings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovalsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{pendingApprovalsError}</div>
                  )}
                  {pendingApprovals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No listings waiting for approval.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingApprovals.map((listing) => (
                        <div key={listing.id} className="card">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={selectedPendingIds.includes(listing.id)}
                                onChange={() => togglePendingSelection(listing.id)}
                                aria-label={`Select ${listing.name}`}
                              />
                              {listing.image_url && (
                                <img
                                  src={listing.image_url}
                                  alt={listing.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-lg">{listing.name}</h4>
                                <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p><strong>Quantity:</strong> {listing.quantity}</p>
                                  <p><strong>Location:</strong> {listing.location}</p>
                                  <p><strong>Posted by:</strong> {listing.user_name || 'Unknown'}</p>
                                  <p>
                                    <strong>Status:</strong>
                                    <span className="ml-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                                      {listing.status}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                className="btn-primary text-sm"
                                disabled={approvalBusyId === listing.id || approvalBulkBusy}
                                onClick={() => handleReviewListing(listing.id, true)}
                              >
                                {approvalBusyId === listing.id ? '…' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                className="btn-danger text-sm"
                                disabled={approvalBusyId === listing.id || approvalBulkBusy}
                                onClick={() => handleReviewListing(listing.id, false)}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedPendingIds.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-primary text-sm"
                        disabled={approvalBulkBusy}
                        onClick={() => handleBulkReviewListings(true)}
                      >
                        Approve selected ({selectedPendingIds.length})
                      </button>
                      <button
                        type="button"
                        className="btn-danger text-sm"
                        disabled={approvalBulkBusy}
                        onClick={() => handleBulkReviewListings(false)}
                      >
                        Decline selected ({selectedPendingIds.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-lg font-semibold">Food Listings Management</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportListingsCsv}
                    disabled={!listings.length}
                    className="btn-secondary flex items-center disabled:opacity-50"
                  >
                    <div className="icon-download mr-2"></div>
                    Export CSV
                  </button>
                  <button
                    onClick={loadListings}
                    className="btn-secondary flex items-center"
                  >
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                </div>
              </div>

              {listingsLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading listings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listingsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{listingsError}</div>
                  )}
                  {listings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No listings found.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.map(listing => (
                        <div key={listing.id} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                {listing.image_url && (
                                  <img
                                    src={listing.image_url}
                                    alt={listing.name}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{listing.name}</h4>
                                  <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                                  <div className="text-sm text-gray-500 space-y-1">
                                    <p><strong>Quantity:</strong> {listing.quantity}</p>
                                    <p><strong>Location:</strong> {listing.location}</p>
                                    <p><strong>Expires:</strong> {listing.expiry_date ? new Date(listing.expiry_date).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Posted by:</strong> {listing.user_name || 'Unknown'}</p>
                                    <p><strong>Status:</strong>
                                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${listing.status === 'available' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                                        listing.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                        listing.status === 'declined' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                        {listing.status}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Category</p>
                                      <span className="text-xs text-green-700">
                                        {listing.category
                                          ? (listingCategoryOptions.find((c) => c.value === listing.category)?.label || listing.category)
                                          : 'Not set'}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {listingCategoryOptions.map((opt) => {
                                        const on = listing.category === opt.value;
                                        return (
                                          <button
                                            key={opt.value}
                                            type="button"
                                            title={`Set category to ${opt.label}`}
                                            onClick={() => handleUpdateListingCategory(listing, opt.value)}
                                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                              on
                                                ? 'bg-green-700 text-white border-green-700'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
                                            }`}
                                          >
                                            {opt.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="btn-danger text-sm ml-4"
                            >
                              <div className="icon-trash mr-1"></div>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Listing Categories</h3>
                  <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    These are the category options in the left sidebar filters on the main map page.
                    Rename labels, show or hide categories, and change order — then save.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={loadListingCategories} className="btn-secondary flex items-center">
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={saveListingCategories}
                    disabled={listingCategoriesSaving || listingCategoriesLoading}
                    className="btn-primary flex items-center disabled:opacity-60"
                  >
                    {listingCategoriesSaving ? 'Saving…' : 'Save categories'}
                  </button>
                </div>
              </div>

              {listingCategoriesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading categories…</div>
              ) : (
                <div className="space-y-3">
                  {listingCategoriesError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{listingCategoriesError}</div>
                  )}

                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-900">
                    <strong>Preview (left sidebar):</strong>{' '}
                    All Categories
                    {listingCategories
                      .filter((c) => c.is_active)
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((c) => ` · ${c.label || c.value}`)
                      .join('')}
                  </div>

                  {listingCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No categories found.</div>
                  ) : (
                    <div className="grid gap-3">
                      {listingCategories
                        .slice()
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .map((cat, index, arr) => (
                          <div key={cat.id} className="card flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                title="Move up"
                                disabled={index === 0}
                                onClick={() => moveListingCategory(cat.id, 'up')}
                                className="px-2 py-1 border rounded text-sm disabled:opacity-40"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move down"
                                disabled={index === arr.length - 1}
                                onClick={() => moveListingCategory(cat.id, 'down')}
                                className="px-2 py-1 border rounded text-sm disabled:opacity-40"
                              >
                                ↓
                              </button>
                              <span className="text-xs font-mono text-gray-500 w-20 truncate" title={cat.value}>
                                {cat.value}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={cat.label || ''}
                              onChange={(e) => updateListingCategoryField(cat.id, { label: e.target.value })}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Display label"
                            />
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!cat.is_active}
                                onChange={(e) => updateListingCategoryField(cat.id, { is_active: e.target.checked })}
                              />
                              Show in sidebar
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Database Status</h3>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${dbStats.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${dbStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStats.connected ? 'Connected to Database' : 'Database Error'}
                  </span>
                </div>
                <button
                  onClick={loadDatabaseStats}
                  className="btn-secondary"
                >
                  Refresh Stats
                </button>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">User Feedback & Bug Reports</h3>
                <button
                  onClick={() => setShowFeedbackViewer(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  View All Feedback
                </button>
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Newsletter Subscribers</h3>
                  <p className="text-sm text-gray-500">{newsletterTotal} active subscriber{newsletterTotal === 1 ? '' : 's'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadNewsletterSubscribers}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={exportNewsletterCsv}
                    disabled={!newsletterSubscribers.length}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {newsletterError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{newsletterError}</div>
              )}
              {newsletterLoading ? (
                <p className="text-gray-500 text-sm">Loading subscribers…</p>
              ) : newsletterSubscribers.length === 0 ? (
                <p className="text-gray-500 text-sm">No subscribers yet. Signups from the landing and Impact Story pages will appear here.</p>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Source</th>
                        <th className="px-3 py-2 font-medium">Subscribed</th>
                        <th className="px-3 py-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterSubscribers.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="px-3 py-2">{s.email}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {[s.first_name, s.last_name].filter(Boolean).join(' ') || '—'}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{s.source || '—'}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => deactivateNewsletterSubscriber(s.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <AdminMessagePanel />
          )}

          {activeTab === 'ai_broadcasts' && (
            <AIBroadcastsPanel />
          )}

          {activeTab === 'ai_query' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-2">AI Query</h2>
              <p className="text-sm text-gray-600 mb-4">
                Ask natural-language questions about listings, users, and platform data (read-only).
              </p>
              <div id="nouri-query-root" />
            </div>
          )}
          </div>
        </div>

        {showFeedbackViewer && (
          <FeedbackViewer onClose={() => setShowFeedbackViewer(false)} />
        )}
      </div>
    );
  } catch (error) {
    console.error('AdminPanel component error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel Error</h2>
          <p className="text-gray-600">Unable to load admin panel</p>
        </div>
      </div>
    );
  }
}

window.AdminPanel = AdminPanel;
