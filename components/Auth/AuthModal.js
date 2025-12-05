// AuthModal component - handles user authentication
// Note: React is available globally from CDN, no import needed

function AuthModal({ onClose, onAuth }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [showDemoOptions, setShowDemoOptions] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'recipient',
    referralCode: ''
  });
  const [referralValid, setReferralValid] = React.useState(null);
  const [referrerName, setReferrerName] = React.useState('');

  const demoUsers = [
    {
      id: 'demo_donor_1',
      name: 'Sarah Chen',
      email: 'sarah@foodbank.demo',
      role: 'donor',
      onboardingCompleted: true,
      address: '123 Restaurant Row, NYC',
      coords: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'demo_recipient_1',
      name: 'Maria Rodriguez',
      email: 'maria@family.demo',
      role: 'recipient',
      onboardingCompleted: true,
      address: '456 Community St, NYC',
      coords: { lat: 40.7200, lng: -73.9900 },
      household_size: 4
    },
    {
      id: 'demo_volunteer_1',
      name: 'Alex Kim',
      email: 'alex@volunteer.demo',
      role: 'volunteer',
      onboardingCompleted: true,
      address: '789 Helper Ave, NYC',
      coords: { lat: 40.7350, lng: -74.0050 },
      vehicle_info: { type: 'car', capacity: 'medium' }
    },
    {
      id: 'demo_dispatcher_1',
      name: 'Jordan Taylor',
      email: 'jordan@dispatch.demo',
      role: 'dispatcher',
      onboardingCompleted: true,
      address: 'NYC Food Distribution Center',
      coords: { lat: 40.7280, lng: -73.9950 }
    },
    {
      id: 'demo_admin_1',
      name: 'Admin User',
      email: 'admin@foodmaps.demo',
      role: 'admin',
      onboardingCompleted: true,
      address: 'Food Maps HQ',
      coords: { lat: 40.7500, lng: -73.9850 }
    },
    {
      id: 'demo_store_owner_1',
      name: 'Store Manager',
      email: 'manager@dogoods.demo',
      role: 'store_owner',
      storeId: 'dogoods-main',
      onboardingCompleted: true,
      address: 'DoGoods Distribution Center',
      coords: { lat: 40.7300, lng: -73.9800 }
    }
  ];

  const [authError, setAuthError] = React.useState('');
  const [captchaVerified, setCaptchaVerified] = React.useState(false);

  const parseJwt = (token) => {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) return null;
      let payload = parts[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad > 0) payload += '='.repeat(4 - pad);
      const json = atob(payload);
      try {
        return JSON.parse(json);
      } catch (e) {
        return JSON.parse(decodeURIComponent(escape(json)));
      }
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login form submitted');
    console.log('Captcha verified:', captchaVerified);
    console.log('Form data:', { email: formData.email, hasPassword: !!formData.password });

    // Check captcha verification
    if (!captchaVerified) {
      console.log('❌ Captcha not verified');
      setAuthError('Please complete the captcha verification');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isNewUser: !isLogin
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) === false) {
      console.log('❌ Invalid email format');
      setAuthError('Please enter a valid email address');
      return;
    }
    if (isLogin) {
      console.log('📧 Attempting login for:', formData.email);
      setAuthError('');
      try {
        const json = await (window.databaseService ? window.databaseService.authLogin(formData.email, formData.password) : {});
        console.log('Login response:', json);
        if (json && json.success && json.token) {
          localStorage.setItem('auth_token', json.token);
          const payload = parseJwt(json.token);
          if (!payload) {
            setAuthError('Invalid token received');
            return;
          }
          console.log('Login - JWT payload:', payload);
          const loggedUser = {
            id: payload.sub || formData.email,
            name: payload.name || formData.email,
            role: payload.role || 'recipient'
          };
          console.log('Login - Setting current_user:', loggedUser);
          localStorage.setItem('current_user', JSON.stringify(loggedUser));
          onAuth(loggedUser);
          onClose();
        } else {
          const err = (json && (json.error || json.message || json.detail)) || 'Invalid email or password';
          setAuthError(err);
        }
      } catch (error) {
        console.error('auth request failed:', error);
        setAuthError(error.message || 'Network error');
        return;
      }
    } else {
      setAuthError('');
      try {
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          referral_code: formData.referralCode || undefined
        };
        const json = await (window.databaseService ? window.databaseService.authRegister(registerData) : {});
        if (json && json.success) {
          // Auto-login after create
          const loginJson = await (window.databaseService ? window.databaseService.authLogin(formData.email, formData.password) : {});
          if (loginJson && loginJson.success && loginJson.token) {
            localStorage.setItem('auth_token', loginJson.token);
            const payload = parseJwt(loginJson.token);
            const loggedUser = {
              id: payload && payload.sub ? payload.sub : formData.email,
              name: payload && payload.name ? payload.name : formData.name,
              role: payload && payload.role ? payload.role : registerData.role
            };
            localStorage.setItem('current_user', JSON.stringify(loggedUser));
            onAuth(loggedUser);
            onClose();
          } else {
            // Fallback: persist local user object (no token)
            localStorage.setItem('current_user', JSON.stringify(userData));
            onAuth(userData);
            onClose();
          }
        } else {
          const err = (json && (json.error || json.message)) || 'Account creation failed';
          setAuthError(err);
        }
      } catch (error) {
        console.error('request failed:', error);
        setAuthError('Network error');
        return;
      }
    }

  };

  const handleDemoLogin = (demoUser) => {
    onAuth(demoUser);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Validate referral code when it changes
    if (field === 'referralCode' && value.length >= 6) {
      validateReferralCode(value);
    } else if (field === 'referralCode' && value.length < 6) {
      setReferralValid(null);
      setReferrerName('');
    }
  };

  const validateReferralCode = async (code) => {
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      setReferralValid(result.valid);
      setReferrerName(result.referrer_name || '');
    } catch (error) {
      setReferralValid(false);
      setReferrerName('');
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-name="auth-modal" data-file="components/Auth/AuthModal.js">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <div className="icon-x text-xl"></div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      // Trigger forgot password modal
                      if (window.showForgotPasswordModal) {
                        window.showForgotPasswordModal();
                      }
                    }}
                    className="text-xs text-[var(--primary-color)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="recipient">Recipient</option>
                  <option value="donor">Donor</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${referralValid === true ? 'border-green-500' :
                      referralValid === false ? 'border-red-500' :
                        'border-[var(--border-color)]'
                    }`}
                />
                {referralValid === true && referrerName && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Referred by {referrerName}
                  </p>
                )}
                {referralValid === false && formData.referralCode && (
                  <p className="text-sm text-red-600 mt-1">
                    Invalid referral code
                  </p>
                )}
              </div>
            )}

            {typeof SimpleCaptcha !== 'undefined' ? (
              <SimpleCaptcha onVerify={setCaptchaVerified} />
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                Captcha loading...
              </div>
            )}

            <button
              type="submit"
              className={`btn-primary w-full ${!captchaVerified ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={!captchaVerified}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            {authError && (
              <div className="text-sm text-red-600 mt-2" role="alert">{authError}</div>
            )}
          </form>



          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--primary-color)] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AuthModal component error:', error);
    return null;
  }
}
