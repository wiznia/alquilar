import { AdvancedMarker, Map } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGeocoding } from '@/app/hooks/useGeocoding';

export default function MapComponent({ address }) {
  const { geocode } = useGeocoding();
  const [coordinates, setCoordinates] = useState({
    lat: -34.6036844,
    lng: -58.3815591,
  });
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const [gestureHandling, setGestureHandling] = useState('none');
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setGestureHandling('greedy');
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setGestureHandling('none');
  };

  const handleDrag = useCallback((ev) => {
    const newCenter = ev.detail.center;
    setCoordinates(newCenter);
  }, []);

  useEffect(() => {
    geocode(address)
      .then((result) => {
        if (result.coordinates) {
          const { lat, lng } = result.coordinates;
          setCoordinates({ lat, lng });
          setInitialCoordinates({ lat, lng });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [address, geocode]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '654px' }}
    >
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={initialCoordinates}
        center={coordinates}
        defaultZoom={17}
        gestureHandling={gestureHandling}
        mapId="DEMO_MAP_ID"
        onDrag={handleDrag}
      >
        {initialCoordinates && <AdvancedMarker position={initialCoordinates} />}
      </Map>
    </div>
  );
}
