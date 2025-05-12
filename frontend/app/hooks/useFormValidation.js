import { useState } from 'react';
import { validateForm } from './validateForm';

export const useFormValidation = (
  initialState,
  formType,
  locationHandlers = {},
) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { setSelectedProvince, setSelectedCity, setSelectedLocalidad } =
    locationHandlers;

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

      if (name === 'provincia' && setSelectedProvince) {
        setSelectedProvince(value);
        if (setSelectedCity) setSelectedCity('');
        if (setSelectedLocalidad) setSelectedLocalidad('');
      } else if (name === 'barrio' && setSelectedCity) {
        setSelectedCity(value);
        if (setSelectedLocalidad) setSelectedLocalidad('');
      } else if (name === 'municipio' && setSelectedLocalidad) {
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
    handleIncrement,
    handleDecrement,
  };
};
