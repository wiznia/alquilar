import { useEffect, useState } from 'react';

export const useProvinceCity = (resource, queryParam, queryValue) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const getResource = async (resource) => {
    try {
      const url = queryValue
        ? `https://apis.datos.gob.ar/georef/api/${resource}?max=1000&${queryParam}=${queryValue}&orden=nombre&aplanar=true&campos=nombre&exacto=true`
        : `https://apis.datos.gob.ar/georef/api/${resource}?max=1000&orden=nombre&aplanar=true&campos=nombre&exacto=true`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.status);
      }
      const json = await response.json();
      setData(json);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (!resource) return;
    getResource(resource, queryParam, queryValue);
  }, [resource, queryParam, queryValue]);

  return { data, error };
};
