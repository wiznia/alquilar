import { useEffect, useState } from 'react';
import { useProvinceCity } from './useProvinceCity';

export const useLocationData = (initialProvince = '', initialCity = '') => {
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedLocalidad, setSelectedLocalidad] = useState('');
  const [cityData, setCityData] = useState([]);
  const [localidadesData, setLocalidadesData] = useState([]);

  const { data: provinceData } = useProvinceCity('provincias');
  const { data: fetchedCityData } = useProvinceCity(
    selectedProvince ? 'localidades' : null,
    selectedProvince ? 'provincia' : null,
    selectedProvince,
  );
  const { data: fetchedLocalidadesData } = useProvinceCity(
    selectedCity ? 'localidades' : null,
    selectedCity ? 'municipio' : null,
    selectedCity,
  );

  useEffect(() => {
    if (fetchedCityData) {
      setCityData(fetchedCityData);
    } else {
      setCityData([]);
    }
  }, [fetchedCityData]);

  useEffect(() => {
    if (fetchedLocalidadesData) {
      setLocalidadesData(fetchedLocalidadesData.localidades || []);
    } else {
      setLocalidadesData([]);
    }
  }, [fetchedLocalidadesData]);

  useEffect(() => {
    setSelectedCity('');
    setCityData([]);
    setLocalidadesData([]);
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedLocalidad('');
    setLocalidadesData([]);
  }, [selectedCity]);

  useEffect(() => {
    if (selectedProvince) {
      setCityData(selectedProvince);
    }
  }, [selectedProvince]);

  return {
    provinceData,
    cityData,
    localidadesData,
    setSelectedProvince,
    setSelectedCity,
    selectedProvince,
    selectedCity,
  };
};
