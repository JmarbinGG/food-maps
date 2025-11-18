function SimpleCaptcha({ onVerify }) {
  console.log('SimpleCaptcha component loaded');
  const [captchaCode, setCaptchaCode] = React.useState('');
  const [userInput, setUserInput] = React.useState('');
  const [isVerified, setIsVerified] = React.useState(false);

  // Generate random captcha code
  const generateCaptcha = React.useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    setIsVerified(false);
  }, []);

  React.useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleVerify = () => {
    const verified = userInput.toUpperCase() === captchaCode;
    setIsVerified(verified);
    onVerify(verified);
  };

  return (
    <div className="captcha-container mb-4">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        Verify you're human
      </label>
      
      <div className="flex items-center space-x-2 mb-2">
        <div 
          className="captcha-display bg-gray-100 border-2 border-gray-300 px-4 py-2 rounded font-mono text-lg tracking-wider select-none"
          style={{
            background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
          }}
        >
          {captchaCode}
        </div>
        
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-2 text-[var(--primary-color)] hover:bg-gray-100 rounded"
          title="Generate new captcha"
        >
          🔄
        </button>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter captcha code"
          className="flex-1 p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          maxLength="5"
        />
        <button
          type="button"
          onClick={handleVerify}
          className={`px-4 py-2 rounded-lg ${
            isVerified 
              ? 'bg-green-500 text-white' 
              : 'bg-[var(--primary-color)] text-white hover:opacity-90'
          }`}
        >
          {isVerified ? '✓' : 'Verify'}
        </button>
      </div>
      
      {isVerified && (
        <div className="text-green-600 text-sm mt-1">✓ Verified successfully</div>
      )}
    </div>
  );
}

// Make it globally available
window.SimpleCaptcha = SimpleCaptcha;