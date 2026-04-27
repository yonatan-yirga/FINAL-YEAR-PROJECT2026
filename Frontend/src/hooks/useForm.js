import { useState } from 'react';

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    // Form handling logic will be added during development
  };

  const handleSubmit = (callback) => {
    // Form submission logic will be added during development
  };

  return { values, errors, handleChange, handleSubmit };
};
