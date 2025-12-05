function ClaimConfirmationModal({ listing, onClose, onConfirm, isOpen }) {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code || code.trim().length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Session expired. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/listings/confirm/${listing.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || 'Invalid code. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (result.success) {
        if (typeof window.showAlert === 'function') {
          window.showAlert('Claim confirmed! You can now pick up the food.', { 
            title: 'Success', 
            variant: 'success' 
          });
        }
        
        // Refresh the page to show updated listing status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        if (onConfirm) onConfirm(result);
        onClose();
      } else {
        setError(result.message || 'Confirmation failed');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setError('Failed to confirm. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    if (error) setError('');
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Your Claim</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Confirmation Code Sent</p>
                <p className="text-sm text-blue-800">
                  A 4-digit code was sent to your phone. Enter it below within 5 minutes to confirm your claim for:
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="font-semibold text-gray-900">{listing.title}</p>
            <p className="text-sm text-gray-600 mt-1">{listing.address}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 4-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={handleCodeChange}
                placeholder="0000"
                className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest"
                maxLength={4}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 4}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isSubmitting || code.length !== 4
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : (
                'Confirm Claim'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive a code? Check your phone or wait a moment for the SMS to arrive.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You have 5 minutes to enter the code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Expose globally
try { window.ClaimConfirmationModal = ClaimConfirmationModal; } catch (e) { }
