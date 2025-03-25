import { useEffect, useState } from 'react';
import { validateForm } from './validateForm';
import { useProvinceCity } from './useProvinceCity';

export const useFormValidation = (initialState, formType) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
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
    setSelectedLocalidad('');
    setCityData([]);
    setLocalidadesData([]);
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedLocalidad('');
    setLocalidadesData([]);
  }, [selectedCity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'number' || type === 'tel') {
      const numberValue = Number(value);
      setForm((prevForm) => ({
        ...prevForm,
        [name]: numberValue,
      }));
    } else if (type === 'file') {
      const fileValue = e.target.files[0];
      setForm((prevForm) => ({
        ...prevForm,
        [name]: fileValue,
      }));
    } else if (type === 'checkbox') {
      setForm((prevForm) => {
        const updatedArray = checked
          ? [...(prevForm[name] || []), value]
          : (prevForm[name] || []).filter((item) => item !== value);

        return {
          ...prevForm,
          [name]: updatedArray,
        };
      });
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));

      if (name === 'provincia') {
        setSelectedProvince(value);
        setSelectedCity('');
        setSelectedLocalidad('');
        setCityData([]);
        setLocalidadesData([]);
      } else if (name === 'barrio') {
        setSelectedCity(value);
        setSelectedLocalidad('');
        setLocalidadesData([]);
      } else if (name === 'municipio') {
        setSelectedLocalidad(value);
      }
    }
  };

  const handleIncrement = (field) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: (prevForm[field] || 0) + 1,
    }));
  };

  const handleDecrement = (field) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: Math.max((prevForm[field] || 0) - 1, 0),
    }));
  };

  const validateFormCheck = () => {
    const newErrors = validateForm(form, formType);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    form,
    setForm,
    errors,
    handleChange,
    validateFormCheck,
    setErrors,
    provinceData,
    cityData,
    localidadesData,
    handleIncrement,
    handleDecrement,
  };
};
