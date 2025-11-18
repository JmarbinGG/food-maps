function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const [step, setStep] = React.useState('email'); // 'email', 'code', 'password'
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
        if (typeof window.showAlert === 'function') {
          window.showAlert('Verification code sent to your email', { title: 'Code Sent', variant: 'success' });
        }
      } else {
        setError(data.detail || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('code', code);
      formData.append('new_password', newPassword);
      
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof window.showAlert === 'function') {
          window.showAlert('Password reset successfully! You can now login with your new password.', { title: 'Success', variant: 'success' });
        }
        onClose();
        if (onBackToLogin) onBackToLogin();
      } else {
        setError(data.detail || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'email' ? 'Reset Password' : step === 'code' ? 'Enter Code' : 'New Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a verification code to {email}. Enter it below to reset your password.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setStep('password'); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary"
              >
                Verify Code
              </button>
            </form>
          </div>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordReset}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new password"
                minLength="8"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm new password"
                minLength="8"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}