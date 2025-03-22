import { useCallback, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const useGeocoding = () => {
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocodingService, setGeocodingService] = useState(null);

  useEffect(() => {
    if (!geocodingLib) return;

    setGeocodingService(new geocodingLib.Geocoder());
  }, [geocodingLib]);

  const geocode = useCallback(
    (input) => {
      return new Promise((resolve, reject) => {
        if (!geocodingService) return;

        if (typeof input === 'string') {
          geocodingService.geocode({ address: input }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const { lat, lng } = results[0].geometry.location;
              resolve({ coordinates: { lat: lat(), lng: lng() } });
            } else {
              reject(`Geocoding failed: ${status}`);
            }
          });
        } else {
          const { lat, lng } = input;
          geocodingService.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                const city = results[0].address_components.filter((address) =>
                  address.types.includes('administrative_area_level_1'),
                )[0].long_name;
                resolve({
                  city,
                });
              } else {
                reject(`Reverse geocoding failed: ${status}`);
              }
            },
          );
        }
      });
    },
    [geocodingService],
  );

  return { geocode };
};
