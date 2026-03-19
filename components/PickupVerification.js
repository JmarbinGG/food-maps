// Pickup Verification Component
function PickupVerification({ listing, onClose, verificationType, onSuccess }) {
  const [photo, setPhoto] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState(null);
  const [notes, setNotes] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [useCamera, setUseCamera] = React.useState(false);
  const [stream, setStream] = React.useState(null);

  // Cleanup camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseCamera(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result);
          setPhotoPreview(reader.result);
          setUseCamera(false);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoPreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      setError('Please take or upload a photo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = verificationType === 'before'
        ? `/api/listings/${listing.id}/verify-before`
        : `/api/listings/${listing.id}/verify-after`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photo: photo,
          notes: notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      if (typeof window.showAlert === 'function') {
        window.showAlert(
          verificationType === 'before'
            ? 'Before-pickup photo uploaded! Proceed to pickup.'
            : 'Pickup completed and verified!',
          { title: 'Success', variant: 'success' }
        );
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to upload verification');
    } finally {
      setUploading(false);
    }
  };

  const isBefore = verificationType === 'before';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {isBefore ? '📸 Before Pickup' : '✅ After Pickup'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {isBefore
                  ? 'Take a photo before picking up the food'
                  : 'Take a photo after receiving the food'}
              </p>
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className={`${isBefore ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <h3 className={`font-semibold ${isBefore ? 'text-blue-900' : 'text-green-900'} mb-2`}>
              {isBefore ? '📋 Before Pickup Instructions' : '📋 After Pickup Instructions'}
            </h3>
            <ul className={`text-sm ${isBefore ? 'text-blue-800' : 'text-green-800'} space-y-1`}>
              {isBefore ? (
                <>
                  <li>• Show the food items as you receive them</li>
                  <li>• Include packaging and quantity in the photo</li>
                  <li>• Ensure the photo is clear and well-lit</li>
                  <li>• This helps verify condition at pickup</li>
                </>
              ) : (
                <>
                  <li>• Show empty containers or packaging</li>
                  <li>• Confirm the pickup was completed</li>
                  <li>• Photo verifies successful transfer</li>
                  <li>• Helps build trust in the community</li>
                </>
              )}
            </ul>
          </div>

          {/* Listing Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-1">{listing.title}</h4>
            <p className="text-sm text-gray-600">{listing.qty} {listing.unit}</p>
          </div>

          {/* Camera/Photo Section */}
          {!photoPreview && !useCamera && (
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Take Photo with Camera
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload from Gallery
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {useCamera && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={() => {
                    setUseCamera(false);
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                    }
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {photoPreview && (
            <div className="space-y-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full rounded-lg border-2 border-gray-300"
              />
              <button
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Take Different Photo
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBefore ? "Condition of items, any concerns..." : "How was the pickup? Any feedback..."}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!photo || uploading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                {isBefore ? '✓ Confirm Before Pickup' : '✓ Complete Pickup'}
              </>
            )}
          </button>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

window.PickupVerification = PickupVerification;
