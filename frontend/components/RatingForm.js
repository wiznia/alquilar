'use client';

import { useEffect, useState } from 'react';

export default function RatingForm({
  role,
  showExpiringDescription = false,
  form,
  setForm,
  errors,
  isLoading,
  onChange,
  onSubmit,
  buttonText = 'Calificar',
  user,
  otherUserData,
}) {
  const [rating, setRating] = useState({});

  let title = '';
  let description = '';

  if (role === 'dueño') {
    title = 'Calificá al dueño:';
    if (showExpiringDescription) {
      description =
        'Tu contrato de alquiler está próximo a terminarse. Calificá al dueño del inmueble:';
    }
  } else if (role === 'inquilino') {
    title = 'Calificá al inquilino:';
  }

  useEffect(() => {
    const ratings = otherUserData?.ratings;
    const userRating = ratings?.find((r) => r.user.id === user?.id);
    if (userRating) {
      setRating({
        rating: userRating.rating,
        message: userRating.message,
      });
      setForm?.((prev) => ({
        ...prev,
        rating: userRating.rating,
        message: userRating.message,
      }));
    }
  }, [otherUserData, user?.id, setForm]);

  return (
    <div className="account__info-inner">
      <h6>{title}</h6>
      {description && <p>{description}</p>}
      <input
        type="range"
        name="rating"
        min="1"
        max="5"
        value={form?.rating ?? rating?.rating ?? 5}
        onChange={onChange}
      />
      <fieldset>
        <label htmlFor="message">Mensaje:</label>
        <textarea
          name="message"
          id="message"
          placeholder="Mensaje"
          value={form?.message ?? rating?.message ?? ''}
          onChange={onChange}
        ></textarea>
        {errors?.message && (
          <small className="text-danger">{errors.message}</small>
        )}
      </fieldset>
      <div className="button-container">
        <button className="button" disabled={isLoading} onClick={onSubmit}>
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <span>{buttonText}</span>
          )}
        </button>
      </div>
    </div>
  );
}
