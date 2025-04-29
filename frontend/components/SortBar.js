'use client';

import { useEffect, useState } from 'react';
import Popover from './Popover';
import { useGeocoding } from '@/app/hooks/useGeocoding';
import { useListingsContext } from './ListingsContext';

export default function SortBar({ count: searchCount }) {
  const { data } = useListingsContext();
  const [userCoords, setUserCoords] = useState({});
  const [locationCity, setLocationCity] = useState('');
  const count = data?.getListings?.count || 0;
  const { geocode } = useGeocoding();
  const orderMenu = [
    {
      name: 'ordenar_por',
      options: [
        { label: 'Menor precio', value: 'precio_ASC' },
        { label: 'Mayor precio', value: 'precio_DESC' },
        { label: 'Más recientes', value: 'createdAt_DESC' },
        { label: 'Más vistos', value: 'viewCount_DESC' },
      ],
    },
  ];

  const geolocationSuccess = (pos) => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setUserCoords(coords);
  };

  const geolocationError = (error) => {
    console.log(error.message);
  };

  useEffect(() => {
    if (geocode && userCoords.lat && userCoords.lng) {
      geocode(userCoords)
        .then((result) => {
          setLocationCity(result?.city);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [userCoords, geocode]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      geolocationSuccess,
      geolocationError,
    );
  }, []);

  return (
    <div className="sort-bar">
      {count > 0 &&
        (!searchCount ? (
          <h6>
            {count} departamento
            {count > 1 || count === 0 ? 's' : ''} en {locationCity}
          </h6>
        ) : (
          <h6>
            {searchCount} departamento
            {searchCount > 1 || searchCount === 0 ? 's' : ''} en Buenos Aires
          </h6>
        ))}
      {orderMenu.map((field) => (
        <Popover key={field.name} props={field} />
      ))}
    </div>
  );
}
