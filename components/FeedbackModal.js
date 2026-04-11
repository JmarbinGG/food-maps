function FeedbackModal({ onClose, initialData = null }) {
  const [formData, setFormData] = React.useState({
    type: initialData?.type || 'general',
    subject: initialData?.subject || '',
    message: initialData?.message || '',
    email: '',
    screenshot: null,
    errorStack: initialData?.errorStack || '',
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [includeScreenshot, setIncludeScreenshot] = React.useState(false);
  const [capturingScreenshot, setCapturingScreenshot] = React.useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', description: 'Report something that isn\'t working' },
    { value: 'error_report', label: 'Error Report', description: 'Report a technical error' },
    { value: 'feature_request', label: 'Feature Request', description: 'Suggest a new feature' },
    { value: 'improvement', label: 'Improvement', description: 'Suggest an enhancement' },
    { value: 'general', label: 'General Feedback', description: 'Share your thoughts' }
  ];

  const captureScreenshot = async () => {
    if (!window.html2canvas) {
      if (window.showAlert) {
        window.showAlert('Screenshot library is still loading. Please try again in a moment.', {
          title: 'Please Wait',
          variant: 'default'
        });
      } else {
        alert('Screenshot library is still loading. Please try again in a moment.');
      }
      return;
    }

    setCapturingScreenshot(true);

    try {
      // Temporarily hide the modal to capture the page behind it
      const modalElement = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      if (modalElement) {
        modalElement.style.display = 'none';
      }

      // Small delay to ensure modal is hidden
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5, // Reduce size for faster processing
        logging: false,
        backgroundColor: '#ffffff'
      });

      const screenshot = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG for smaller size
      setFormData(prev => ({ ...prev, screenshot }));
      setIncludeScreenshot(true);

      // Restore modal
      if (modalElement) {
        modalElement.style.display = '';
      }

      if (window.showAlert) {
        window.showAlert('Screenshot captured successfully!', {
          title: 'Success',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error);

      // Restore modal even if capture failed
      const modalElement = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      if (modalElement) {
        modalElement.style.display = '';
      }

      if (window.showAlert) {
        window.showAlert('Could not capture screenshot. Please describe the issue in detail instead.', {
          title: 'Capture Failed',
          variant: 'destructive'
        });
      } else {
        alert('Could not capture screenshot. Please describe the issue in detail.');
      }
    } finally {
      setCapturingScreenshot(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      setSubmitted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again or contact support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="icon-check text-3xl text-green-600"></div>
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
          <p className="text-sm text-gray-500 mt-2">We appreciate you taking the time to help us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Send Feedback</h2>
            <p className="text-sm text-gray-600">Help us improve Food Maps</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            type="button"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feedbackTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${formData.type === type.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of the issue or feedback"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please provide as much detail as possible. What happened? What did you expect to happen?"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The more details you provide, the better we can help!
            </p>
          </div>

          {/* Email for anonymous users */}
          {!localStorage.getItem('auth_token') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to follow up with you (optional)
              </p>
            </div>
          )}

          {/* Error Stack (if provided) */}
          {formData.errorStack && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-red-800 mb-2">
                Error Information (automatically captured)
              </label>
              <pre className="text-xs text-red-700 overflow-x-auto p-2 bg-white rounded border border-red-100">
                {formData.errorStack}
              </pre>
            </div>
          )}

          {/* Screenshot Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Include Screenshot
              </label>
              <button
                type="button"
                onClick={captureScreenshot}
                disabled={capturingScreenshot || isSubmitting}
                className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {capturingScreenshot ? 'Capturing...' : includeScreenshot ? 'Captured' : 'Capture Screen'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              A screenshot helps us understand the issue better
            </p>
            {includeScreenshot && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium">Screenshot attached</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeScreenshot(false);
                      setFormData(prev => ({ ...prev, screenshot: null }));
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Technical Info */}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">
              Technical information (automatically included)
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded space-y-1">
              <div><strong>URL:</strong> {formData.url}</div>
              <div><strong>Browser:</strong> {formData.userAgent.split(' ').slice(0, 3).join(' ')}</div>
            </div>
          </details>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export to window for global access
window.FeedbackModal = FeedbackModal;

