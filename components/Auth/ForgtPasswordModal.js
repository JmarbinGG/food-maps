function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const [step, setStep] = React.useState('request'); // 'request', 'verify', 'success'
  const [email, setEmail] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [debugCode, setDebugCode] = React.useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const params = new URLSearchParams({ email }).toString();
      const response = await fetch('/api/user/forgot-password?' + params, { 
        method: 'POST' 
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setStep('verify');
        
        // Show debug code if available (development mode)
        if (data.debug_code) {
          setDebugCode(data.debug_code);
          console.log('🔑 Verification Code:', data.debug_code);
        }
      } else {
        setError(data.detail || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ 
        email, 
        code: verificationCode, 
        new_password: newPassword 
      }).toString();
      
      const response = await fetch('/api/user/reset-password?' + params, { 
        method: 'POST' 
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        setStep('success');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          onBackToLogin();
        }, 3000);
      } else {
        setError(data.detail || 'Invalid verification code or password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-name="forgot-password-modal">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          {/* Request Reset Step */}
          {step === 'request' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  🔐 Forgot Password?
                </h2>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <div className="icon-x text-xl"></div>
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={onBackToLogin}
                  className="text-sm text-[var(--primary-color)] hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* Verify Code and Reset Password Step */}
          {step === 'verify' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  ✉️ Check Your Email
                </h2>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <div className="icon-x text-xl"></div>
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-4">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>

              {/* Debug code display (development mode) */}
              {debugCode && (
                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 mb-4 text-center">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">🔧 Development Mode</p>
                  <p className="text-2xl font-bold text-blue-600 tracking-widest">{debugCode}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Check server console for email output</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-center text-2xl tracking-widest"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength="8"
                    className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength="8"
                    className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleBackToRequest}
                  className="text-sm text-[var(--primary-color)] hover:underline"
                >
                  ← Request a new code
                </button>
              </div>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  ✅ Success!
                </h2>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <div className="icon-x text-xl"></div>
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                <p className="font-medium">Password Reset Successful!</p>
                <p className="text-sm mt-1">Your password has been updated. You can now sign in with your new password.</p>
              </div>

              <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
                Redirecting to sign in...
              </p>

              <button 
                onClick={onBackToLogin}
                className="btn-primary w-full"
              >
                Go to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ForgotPasswordModal component error:', error);
    return null;
  }
}