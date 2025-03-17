import { useState } from 'react';
import { validateForm } from './validateForm';

export const useFormValidation = (initialState, formType) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    });
  };

  const validateFormCheck = () => {
    const newErrors = validateForm(form, formType);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { form, errors, handleChange, validateFormCheck, setErrors };
};
