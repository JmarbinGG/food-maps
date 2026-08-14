function ReferralDashboard({ onClose }) {
  const [referralData, setReferralData] = React.useState({
    referral_code: '',
    referral_count: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    loadReferralData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
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

  const shareReferralCode = () => {
    const shareText = `Join Food Maps and help reduce food waste! Use my referral code: ${referralData.referral_code}`;
    const shareUrl = `${window.location.origin}?ref=${referralData.referral_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Food Maps',
        text: shareText,
        url: shareUrl
      });
    } else {
      copyReferralCode();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Your Referral Code</h3>
              <div className="flex items-center justify-center space-x-2">
                <code className="bg-white px-3 py-2 rounded border text-lg font-mono">
                  {referralData.referral_code}
                </code>
                <button
                  onClick={copyReferralCode}
                  className="btn-secondary text-sm"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <div className="icon-check text-green-600"></div>
                  ) : (
                    <div className="icon-copy"></div>
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{referralData.referral_count}</div>
              <div className="text-sm text-blue-800">People Referred</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={shareReferralCode}
              className="btn-primary w-full flex items-center justify-center"
            >
              <div className="icon-share mr-2"></div>
              Share Referral Code
            </button>
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
      </div>
    </div>
  );
}

window.ReferralDashboard = ReferralDashboard;