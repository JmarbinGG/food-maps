// Safety and Trust Center Component
function SafetyCenter({ user, onClose }) {
  const [activeTab, setActiveTab] = React.useState('guidelines');
  const [trustScore, setTrustScore] = React.useState(null);
  const [verificationStatus, setVerificationStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [reportForm, setReportForm] = React.useState({
    type: '',
    description: '',
    listingId: '',
    evidence: ''
  });
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch user's trust score and verification status
  React.useEffect(() => {
    if (user) {
      fetchTrustData();
    }
  }, [user]);

  const fetchTrustData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/trust-score', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrustScore(data.trust_score || 50);
        setVerificationStatus(data.verification_status || {});
      } else {
        // Set default values if API fails
        setTrustScore(50);
        setVerificationStatus({
          verified: false,
          email_verified: false,
          phone_verified: false,
          id_verified: false,
          address_verified: false
        });
      }
    } catch (error) {
      console.error('Error fetching trust data:', error);
      // Set default values on error
      setTrustScore(50);
      setVerificationStatus({
        verified: false,
        email_verified: false,
        phone_verified: false,
        id_verified: false,
        address_verified: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!reportForm.type || !reportForm.description) {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Please fill in all required fields', {
          title: 'Missing Information',
          variant: 'default'
        });
      }
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportForm)
      });

      if (response.ok) {
        if (typeof window.showAlert === 'function') {
          window.showAlert('Report submitted successfully. Our team will review it within 24 hours.', {
            title: 'Report Submitted',
            variant: 'success'
          });
        }

        setReportForm({
          type: '',
          description: '',
          listingId: '',
          evidence: ''
        });
        setActiveTab('guidelines');
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to submit report. Please try again.', {
          title: 'Error',
          variant: 'default'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerification = async (type) => {
    console.log('handleVerification called with type:', type);
    try {
      const token = localStorage.getItem('auth_token');

      if (type === 'email') {
        console.log('Processing email verification...');
        // Send verification email
        const response = await fetch('/api/user/send-verification-email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          if (typeof window.showAlert === 'function') {
            window.showAlert('Verification email sent! Please check your inbox and click the link to verify.', {
              title: 'Email Sent',
              variant: 'success'
            });
          }
        } else {
          throw new Error('Failed to send verification email');
        }
      } else if (type === 'phone') {
        console.log('Processing phone verification...');
        // Trigger phone verification modal
        if (typeof window.requestPhone === 'function') {
          await window.requestPhone();
          fetchTrustData(); // Refresh data after verification
        } else {
          if (typeof window.showAlert === 'function') {
            window.showAlert('Phone verification will be available in your profile settings.', {
              title: 'Phone Verification',
              variant: 'default'
            });
          }
        }
      } else if (type === 'id') {
        console.log('Processing ID verification...');
        if (typeof window.showAlert === 'function') {
          window.showAlert('Photo ID verification is coming soon! This will allow you to upload a government-issued ID.', {
            title: 'Coming Soon',
            variant: 'default'
          });
        }
      } else if (type === 'address') {
        console.log('Processing address verification...');
        if (typeof window.showAlert === 'function') {
          window.showAlert('Address verification is coming soon! This will verify your pickup location.', {
            title: 'Coming Soon',
            variant: 'default'
          });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Verification request failed. Please try again.', {
          title: 'Error',
          variant: 'default'
        });
      }
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const safetyGuidelines = [
    {
      icon: '🔒',
      title: 'Meet in Public Places',
      description: 'Always arrange pickups in well-lit, public locations. Avoid private residences when possible.',
      priority: 'high'
    },
    {
      icon: '📸',
      title: 'Use Photo Verification',
      description: 'Take before and after photos for all pickups. This builds trust and provides accountability.',
      priority: 'high'
    },
    {
      icon: '🕐',
      title: 'Stick to Pickup Windows',
      description: 'Arrive during agreed pickup times. This ensures both parties are prepared and safe.',
      priority: 'medium'
    },
    {
      icon: '🚫',
      title: 'Never Share Personal Info',
      description: 'Don\'t share your home address, email, or social media until after successful exchanges.',
      priority: 'medium'
    },
    {
      icon: '🧊',
      title: 'Food Safety Standards',
      description: 'Check food temperature, packaging, and expiration. When in doubt, don\'t consume.',
      priority: 'high'
    },
    {
      icon: '👥',
      title: 'Bring a Friend',
      description: 'Consider bringing someone with you for pickups, especially for first-time exchanges.',
      priority: 'medium'
    },
    {
      icon: '📱',
      title: 'Keep Communication on Platform',
      description: 'Use in-app messaging for safety. This provides a record and protection.',
      priority: 'medium'
    },
    {
      icon: '🚨',
      title: 'Report Suspicious Activity',
      description: 'If something feels wrong, report it immediately. Trust your instincts.',
      priority: 'high'
    }
  ];

  const trustScoreTips = [
    { icon: '✅', text: 'Complete your profile with photo and verification', points: '+10' },
    { icon: '📸', text: 'Upload verification photos for pickups', points: '+5 each' },
    { icon: '⭐', text: 'Receive positive feedback from community', points: '+3 each' },
    { icon: '📅', text: 'Consistently show up on time', points: '+2 each' },
    { icon: '💬', text: 'Respond quickly to messages', points: '+1 each' },
    { icon: '🎯', text: 'Complete dietary preferences (recipients)', points: '+5' },
    { icon: '📊', text: 'Donate regularly (donors)', points: '+5 each' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🛡️</div>
              <div>
                <h2 className="text-2xl font-bold">Safety & Trust Center</h2>
                <p className="text-blue-100 text-sm">Building a safe community together</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'guidelines'
                ? 'bg-white text-blue-600'
                : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
            >
              📋 Guidelines
            </button>
            <button
              onClick={() => setActiveTab('trust')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'trust'
                ? 'bg-white text-blue-600'
                : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
            >
              ⭐ Trust Score
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'verification'
                ? 'bg-white text-blue-600'
                : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
            >
              ✓ Verification
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'report'
                ? 'bg-white text-blue-600'
                : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
            >
              🚨 Report
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Safety Guidelines Tab */}
          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Safety Guidelines</h3>
                <p className="text-gray-600">Follow these best practices to ensure safe food exchanges</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {safetyGuidelines.map((guideline, index) => (
                  <div
                    key={index}
                    className={`border-l-4 rounded-lg p-4 ${guideline.priority === 'high'
                      ? 'border-red-500 bg-red-50'
                      : 'border-yellow-500 bg-yellow-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{guideline.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{guideline.title}</h4>
                          {guideline.priority === 'high' && (
                            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                              IMPORTANT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{guideline.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6 mt-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🚨</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 text-lg mb-2">Emergency Situations</h4>
                    <p className="text-red-800 mb-3">
                      If you feel unsafe or encounter an emergency situation:
                    </p>
                    <ul className="space-y-2 text-red-800">
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        Call 911 immediately if you're in danger
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        Leave the situation and go to a safe place
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        Report the incident through our platform
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        Contact our 24/7 safety hotline: (555) 123-SAFE
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trust Score Tab */}
          {activeTab === 'trust' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Trust Score</h3>
                <p className="text-gray-600">Build trust through positive community interactions</p>
              </div>

              {/* Trust Score Display */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-4xl">⭐</div>
                  <p className="text-gray-600 mt-2">Loading your trust score...</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getTrustScoreColor(trustScore || 50)} mb-4`}>
                    <div>
                      <div className="text-4xl font-bold">{trustScore || 50}</div>
                      <div className="text-sm font-medium">/ 100</div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {getTrustScoreLabel(trustScore || 50)} Trust Score
                  </h4>
                  <p className="text-gray-600">
                    {(trustScore || 50) >= 90 && 'You\'re a highly trusted community member! Keep up the excellent work.'}
                    {(trustScore || 50) >= 70 && (trustScore || 50) < 90 && 'You\'re building a solid reputation. Keep engaging positively!'}
                    {(trustScore || 50) >= 50 && (trustScore || 50) < 70 && 'You\'re on the right track. Follow the tips below to improve.'}
                    {(trustScore || 50) < 50 && 'Let\'s work on building your trust score. Start with the tips below!'}
                  </p>
                </div>
              )}

              {/* How to Improve */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📈</span>
                  How to Improve Your Trust Score
                </h4>
                <div className="space-y-3">
                  {trustScoreTips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="text-2xl">{tip.icon}</div>
                      <div className="flex-1 text-gray-700">{tip.text}</div>
                      <div className="text-green-600 font-bold">{tip.points}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Score Breakdown */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-green-700">
                    {user?.completed_exchanges || 0}
                  </div>
                  <div className="text-sm text-green-600">Completed Exchanges</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {user?.positive_feedback || 0}
                  </div>
                  <div className="text-sm text-blue-600">Positive Feedback</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">📸</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {user?.verified_pickups || 0}
                  </div>
                  <div className="text-sm text-purple-600">Verified Pickups</div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Verification</h3>
                <p className="text-gray-600">Verify your identity to build trust in the community</p>
              </div>

              {/* Verification Status */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">Verification Status</h4>
                  {verificationStatus?.verified ? (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold">
                      Not Verified
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <VerificationItem
                    icon="📧"
                    title="Email Verification"
                    status={verificationStatus?.email_verified || user?.email_verified || false}
                    description="Verify your email address"
                    onVerify={() => handleVerification('email')}
                  />
                  <VerificationItem
                    icon="📱"
                    title="Phone Verification"
                    status={verificationStatus?.phone_verified || user?.phone_verified || false}
                    description="Verify your phone number via SMS"
                    onVerify={() => handleVerification('phone')}
                  />
                  <VerificationItem
                    icon="📸"
                    title="Photo ID"
                    status={verificationStatus?.id_verified || false}
                    description="Upload a government-issued ID (optional but recommended)"
                    onVerify={() => handleVerification('id')}
                  />
                  <VerificationItem
                    icon="📍"
                    title="Address Verification"
                    status={verificationStatus?.address_verified || false}
                    description="Verify your pickup address"
                    onVerify={() => handleVerification('address')}
                  />
                </div>
              </div>

              {/* Benefits of Verification */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">✨ Benefits of Verification</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">🛡️</span>
                    <div className="text-sm text-gray-700">
                      <strong>Increased Trust:</strong> Verified users are prioritized in the community
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl">⭐</span>
                    <div className="text-sm text-gray-700">
                      <strong>Higher Trust Score:</strong> Boost your score by +10 points
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-2xl">🎯</span>
                    <div className="text-sm text-gray-700">
                      <strong>Better Matches:</strong> Get paired with verified users first
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">🔒</span>
                    <div className="text-sm text-gray-700">
                      <strong>Account Security:</strong> Protect your account from misuse
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Safety Concern</h3>
                <p className="text-gray-600">Help us maintain a safe community by reporting issues</p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Issue *
                  </label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select issue type...</option>
                    <option value="unsafe_food">Unsafe Food Condition</option>
                    <option value="no_show">User Didn't Show Up</option>
                    <option value="harassment">Harassment or Abuse</option>
                    <option value="fraud">Fraudulent Listing</option>
                    <option value="inappropriate">Inappropriate Behavior</option>
                    <option value="safety_concern">General Safety Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Listing ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Listing ID (if applicable)
                  </label>
                  <input
                    type="text"
                    value={reportForm.listingId}
                    onChange={(e) => setReportForm({ ...reportForm, listingId: e.target.value })}
                    placeholder="Enter listing ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Please describe the issue in detail..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence (optional)
                  </label>
                  <textarea
                    value={reportForm.evidence}
                    onChange={(e) => setReportForm({ ...reportForm, evidence: e.target.value })}
                    placeholder="Any additional information, screenshots, or evidence..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <strong>Privacy:</strong> Your report will be kept confidential. We'll review it within 24 hours and take appropriate action.
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Verification Item Component
function VerificationItem({ icon, title, status, description, onVerify }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('VerificationItem button clicked:', title);
    if (onVerify && typeof onVerify === 'function') {
      onVerify();
    } else {
      console.error('onVerify is not a function:', onVerify);
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${status ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
      }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="text-2xl">{icon}</div>
        <div>
          <h5 className="font-bold text-gray-900">{title}</h5>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {status ? (
        <div className="flex items-center gap-2 text-green-600 font-bold">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </div>
      ) : (
        <button
          onClick={handleClick}
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          Verify
        </button>
      )}
    </div>
  );
}

// Export components
window.SafetyCenter = SafetyCenter;
