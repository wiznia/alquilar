import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useState } from 'react';

export default function MapComponent({ address }) {
  const map = useMap();
  const [coordinates, setCoordinates] = useState({
    lat: -34.6036844,
    lng: -58.3815591,
  });
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocodingService, setGeocodingService] = useState(null);

  const handleDrag = useCallback((ev) => {
    const newCenter = ev.detail.center;
    setCoordinates(newCenter);
  }, []);

  useEffect(() => {
    if (!geocodingLib || !map) return;

    setGeocodingService(new geocodingLib.Geocoder());
  }, [geocodingLib, map]);

  useEffect(() => {
    if (!geocodingService) return;

    geocodingService.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;

        setCoordinates({ lat: lat(), lng: lng() });
        setInitialCoordinates({ lat: lat(), lng: lng() });
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  }, [geocodingService]);

  return (
    <Map
      style={{ width: '100%', height: '654px' }}
      defaultCenter={initialCoordinates}
      center={coordinates}
      defaultZoom={17}
      gestureHandling={'greedy'}
      mapId="DEMO_MAP_ID"
      onDrag={handleDrag}
    >
      <AdvancedMarker position={initialCoordinates} />
    </Map>
  );
}
