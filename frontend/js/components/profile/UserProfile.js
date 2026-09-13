function UserProfile({ user, onClose, onUserUpdate, initialTab = 'account' }) {
  const [activeTab, setActiveTab] = React.useState(initialTab || 'account');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: '', text: '' });
  const A11Y_ROOT_ID = 'nouri-a11y-settings-root';

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (activeTab !== 'accessibility') {
      window.FoodMapsNouri?.unmountAccessibilitySettings?.(A11Y_ROOT_ID);
      return undefined;
    }
    const mount = () => {
      if (!document.getElementById(A11Y_ROOT_ID)) return;
      window.FoodMapsNouri?.mountAccessibilitySettings?.(A11Y_ROOT_ID);
    };
    mount();
    const t = setTimeout(mount, 50);
    return () => {
      clearTimeout(t);
      window.FoodMapsNouri?.unmountAccessibilitySettings?.(A11Y_ROOT_ID);
    };
  }, [activeTab]);

  React.useEffect(() => () => {
    window.FoodMapsNouri?.unmountAccessibilitySettings?.(A11Y_ROOT_ID);
  }, []);

  const [accountData, setAccountData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || ''
  });
  const [communityInfo, setCommunityInfo] = React.useState({
    community_id: user?.community_id ?? null,
    approval_number: user?.approval_number || '',
    community_name: ''
  });
  const formDirtyRef = React.useRef(false);

  const markAccountDirty = React.useCallback((updater) => {
    formDirtyRef.current = true;
    setAccountData(updater);
  }, []);

  // Committed role for badge/copy — draft select does not apply until Update Profile.
  const committedRole = String(user?.role || accountData.role || '').toLowerCase();
  const draftRole = String(accountData.role || '').toLowerCase();
  const rolePending = Boolean(draftRole && committedRole && draftRole !== committedRole);

  const roleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800';
    if (role === 'donor') return 'bg-green-100 text-green-800';
    if (role === 'recipient') return 'bg-blue-100 text-blue-800';
    if (role === 'volunteer') return 'bg-yellow-100 text-yellow-800';
    if (role === 'driver') return 'bg-indigo-100 text-indigo-800';
    if (role === 'dispatcher') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };
  const roleLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'donor') return 'Donor';
    if (role === 'recipient') return 'Recipient';
    if (role === 'volunteer') return 'Volunteer';
    if (role === 'driver') return 'Driver';
    if (role === 'dispatcher') return 'Dispatcher';
    return 'User';
  };
  const roleHint = (role) => {
    if (role === 'admin') return 'Full platform access';
    if (role === 'donor') return 'Can share food donations';
    if (role === 'recipient') return 'Can request and claim food';
    if (role === 'volunteer') return 'Can volunteer for deliveries';
    if (role === 'driver') return 'Can deliver food donations';
    if (role === 'dispatcher') return 'Can coordinate deliveries';
    return '';
  };

  // JWT is_admin stays true for the session even after switching active role,
  // so admins can restore Admin without re-login / privilege escalation for others.
  const canRestoreAdmin = React.useMemo(() => {
    if (user?.is_admin === true || String(user?.role || '').toLowerCase() === 'admin') {
      return true;
    }
    if (String(accountData.role || '').toLowerCase() === 'admin') return true;
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json);
      return payload?.is_admin === true;
    } catch (_) {
      return false;
    }
  }, [user?.is_admin, user?.role, accountData.role]);

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [referralData, setReferralData] = React.useState({
    referral_code: '',
    referral_count: 0
  });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok || cancelled) return;
        const userData = await response.json();
        if (cancelled) return;

        // Do not clobber unsaved draft edits (e.g. pending role selection).
        if (!formDirtyRef.current) {
          setAccountData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            role: userData.role || ''
          });
        }
        setCommunityInfo({
          community_id: userData.community_id ?? null,
          approval_number: userData.approval_number || '',
          community_name: userData.community_name || '',
        });
        // Stamp missing durable privilege once — never loop on every /me.
        if (
          userData.is_admin === true
          && user?.is_admin !== true
          && typeof onUserUpdate === 'function'
        ) {
          onUserUpdate({ ...user, is_admin: true });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (!cancelled && !formDirtyRef.current && user) {
          setAccountData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || ''
          });
        }
      }
    };

    fetchUserData();

    if (activeTab === 'referral') {
      loadReferralData();
    }
    return () => { cancelled = true; };
    // Depend on user id (not whole user object) to avoid submit → setUser → re-fetch loops.
  }, [user?.id, activeTab]);

  const loadReferralData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/user/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = referralData.referral_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        const prevRole = (user && user.role) ? String(user.role).toLowerCase() : '';
        // Read privilege from the pre-swap JWT before overwriting the token.
        let jwtIsAdmin = false;
        try {
          const existingToken = localStorage.getItem('auth_token');
          if (existingToken) {
            const parts = existingToken.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              jwtIsAdmin = payload?.is_admin === true;
            }
          }
        } catch (_) { /* ignore */ }
        if (data?.token) {
          localStorage.setItem('auth_token', data.token);
        }
        // Prefer server role so a rejected restore cannot leave the UI lying.
        const nextRole = data?.role
          ? String(data.role).toLowerCase()
          : (accountData.role ? String(accountData.role).toLowerCase() : '');
        // Preserve durable admin privilege separately from active UX role.
        const keepAdmin =
          data?.is_admin === true
          || user?.is_admin === true
          || jwtIsAdmin
          || nextRole === 'admin';
        const updatedUser = {
          ...user,
          ...accountData,
          ...data,
          role: data?.role || nextRole || accountData.role,
          is_admin: keepAdmin,
          community_id: data?.community_id ?? user?.community_id ?? null,
          approval_number: data?.approval_number ?? user?.approval_number ?? null,
        };
        formDirtyRef.current = false;
        setAccountData((prev) => ({
          ...prev,
          name: data?.name ?? prev.name,
          email: data?.email ?? prev.email,
          phone: data?.phone ?? prev.phone,
          address: data?.address ?? prev.address,
          role: data?.role || prev.role,
        }));
        delete updatedUser.token;
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
        window.dispatchEvent(new CustomEvent('foodmaps:auth_changed'));
        // Notify the rest of the app (AI chat, dashboards, etc.) that
        // the active role changed so role-aware UIs can refresh without
        // a page reload.
        const roleChanged = prevRole !== nextRole;
        if (roleChanged && typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('roleChanged', {
              detail: { previousRole: prevRole, role: nextRole, user: updatedUser },
            }));
          } catch (_) { /* ignore */ }
          // Close so Header CTAs are immediately clickable (modal was covering them).
          if (typeof onClose === 'function') {
            onClose();
          }
        }
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${
        activeTab === 'accessibility' ? 'max-w-lg' : 'max-w-md'
      }`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'account'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Account Info
          </button>
          {user?.role === 'recipient' && (
            <button
              onClick={() => setActiveTab('dietary')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'dietary'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Dietary Needs
            </button>
          )}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'favorites'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'password'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'referral'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Referrals
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'accessibility'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Accessibility
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`mb-4 p-3 rounded ${message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
              {message.text}
            </div>
          )}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {/* Account Status/Role Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${roleBadgeClass(committedRole)}`}>
                      {roleLabel(committedRole)}
                    </span>
                    <span className="text-xs text-gray-500 italic">
                      {roleHint(committedRole)}
                    </span>
                  </div>

                  {/* Role Switcher — dispatcher locked; admins may switch to donor/recipient and back */}
                  {committedRole !== 'dispatcher' && draftRole !== 'dispatcher' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Change Role (saved on Update Profile)
                      </label>
                      <select
                        value={accountData.role}
                        onChange={(e) => {
                          const value = e.target.value;
                          markAccountDirty((prev) => ({ ...prev, role: value }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        {canRestoreAdmin && (
                          <option value="admin">Admin - Full platform access</option>
                        )}
                        <option value="donor">Donor - Share food donations</option>
                        <option value="recipient">Recipient - Request and claim food</option>
                        {/* <option value="driver"> Driver - Deliver food donations</option>
                        <option value="volunteer"> Volunteer - Help with deliveries</option> */}
                      </select>
                      {rolePending ? (
                        <p className="text-xs text-amber-700 mt-1 font-medium">
                          Selected {roleLabel(draftRole)}. Click Update Profile to apply.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          {canRestoreAdmin
                            ? 'Switch to donor or recipient to use those flows. Admin stays available while this session keeps admin privilege.'
                            : 'You can switch between these roles anytime'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Community</label>
                {communityInfo.community_id != null || communityInfo.approval_number ? (
                  <div className="space-y-1 text-sm text-gray-800">
                    <p className="font-medium">
                      {communityInfo.community_name
                        || (communityInfo.community_id != null
                          ? `Community #${communityInfo.community_id}`
                          : 'Not assigned')}
                    </p>
                    {communityInfo.approval_number && (
                      <p className="text-gray-600">
                        Approval code:{' '}
                        <code className="bg-white border px-1.5 py-0.5 rounded text-xs">
                          {communityInfo.approval_number}
                        </code>
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Set by your signup approval code. Contact a Food Maps admin to change it.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No community assigned yet. An admin can place you in a school or hub group.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    markAccountDirty((prev) => ({ ...prev, name: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    markAccountDirty((prev) => ({ ...prev, email: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                  {!accountData.phone && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">Required for SMS notifications</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={accountData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    markAccountDirty((prev) => ({ ...prev, phone: value }));
                  }}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {!accountData.phone && (
                  <p className="mt-1 text-xs text-gray-500">
                    Add your phone number to enable SMS text notifications for food alerts
                  </p>
                )}
                {accountData.phone && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    Phone number saved - SMS notifications available
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={accountData.address}
                  onChange={(e) => {
                    const value = e.target.value;
                    markAccountDirty((prev) => ({ ...prev, address: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          )}

          {activeTab === 'dietary' && user?.role === 'recipient' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  Dietary Preferences
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set your dietary needs to get personalized food recommendations that match your requirements.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    window.openDietaryPreferences?.();
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-medium"
                >
                  Manage Dietary Preferences
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Benefits:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">Included</span>
                    <span>Get personalized food recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">Included</span>
                    <span>Filter out allergens automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">Included</span>
                    <span>See portion sizes for your household</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">Included</span>
                    <span>Find food matching your dietary restrictions</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  minLength="8"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  minLength="8"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  My Favorites
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  View and manage your saved favorite locations for quick access.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    window.openFavoritesPanel?.();
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition font-medium"
                >
                  Open Favorites
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">Tip</span>
                    <span>Star listings and map pins to save trusted spots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">Tip</span>
                    <span>Get directions to any saved favorite location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">Tip</span>
                    <span>Keep notes and tags on places you visit often</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'referral' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Your Referral Code</h3>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-2 rounded border text-lg font-mono flex-1">
                    {referralData.referral_code}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Copy to clipboard"
                  >
                    {copied ? '' : 'Copy'}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{referralData.referral_count}</div>
                <div className="text-sm text-blue-800">People Referred</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Share your referral code with friends</li>
                  <li>• They enter it when signing up</li>
                  <li>• Help grow the Food Maps community</li>
                  <li>• Reduce food waste together!</li>
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'accessibility' && (
            <div id="nouri-a11y-settings-root" className="min-h-[12rem]" />
          )}
        </div>
      </div>
    </div >
  );
}