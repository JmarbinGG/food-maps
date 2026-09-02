import { useCallback, useEffect, useState } from 'react';

export function useEffectiveLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const enableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setError(null);
      },
      (err) => setError(err.message || 'Location denied'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  const refreshLocation = enableLocation;

  useEffect(() => {
    enableLocation();
  }, [enableLocation]);

  return { location, error, enableLocation, refreshLocation };
}
