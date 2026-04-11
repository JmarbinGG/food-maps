function UserProfile({ user, onClose, onUserUpdate }) {
  const [activeTab, setActiveTab] = React.useState('account');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: '', text: '' });

  const [accountData, setAccountData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || ''
  });

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
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setAccountData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            role: userData.role || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (user) {
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
  }, [user, activeTab]);

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
        const updatedUser = { ...user, ...accountData };
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'account'
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
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'referral'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Referrals
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${accountData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      accountData.role === 'donor' ? 'bg-green-100 text-green-800' :
                        accountData.role === 'recipient' ? 'bg-blue-100 text-blue-800' :
                          accountData.role === 'volunteer' ? 'bg-yellow-100 text-yellow-800' :
                            accountData.role === 'driver' ? 'bg-indigo-100 text-indigo-800' :
                              accountData.role === 'dispatcher' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                      }`}>
                      {accountData.role === 'admin' && 'Admin'}
                      {accountData.role === 'donor' && 'Donor'}
                      {accountData.role === 'recipient' && 'Recipient'}
                      {accountData.role === 'volunteer' && 'Volunteer'}
                      {accountData.role === 'driver' && 'Driver'}
                      {accountData.role === 'dispatcher' && 'Dispatcher'}
                      {!accountData.role && 'User'}
                    </span>
                    <span className="text-xs text-gray-500 italic">
                      {accountData.role === 'admin' && 'Full platform access'}
                      {accountData.role === 'donor' && 'Can share food donations'}
                      {accountData.role === 'recipient' && 'Can request and claim food'}
                      {accountData.role === 'volunteer' && 'Can volunteer for deliveries'}
                      {accountData.role === 'driver' && 'Can deliver food donations'}
                      {accountData.role === 'dispatcher' && 'Can coordinate deliveries'}
                    </span>
                  </div>

                  {/* Role Switcher - Only for donor, recipient, driver, volunteer */}
                  {accountData.role !== 'admin' && accountData.role !== 'dispatcher' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Change Role:</label>
                      <select
                        value={accountData.role}
                        onChange={(e) => setAccountData({ ...accountData, role: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="donor">Donor - Share food donations</option>
                        <option value="recipient">Recipient - Request and claim food</option>
                        {/* <option value="driver"> Driver - Deliver food donations</option>
                        <option value="volunteer"> Volunteer - Help with deliveries</option> */}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">You can switch between these roles anytime</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
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
                  onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
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
                  onChange={(e) => setAccountData({ ...accountData, address: e.target.value })}
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
            <div>
              <window.FavoritesPanel onClose={() => setActiveTab('account')} />
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
        </div>
      </div>
    </div >
  );
}