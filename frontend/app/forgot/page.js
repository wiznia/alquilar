'use client';

import { REQUEST_PASSWORD_RESET } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useState } from 'react';

export default function Page() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await requestReset({
        variables: {
          email,
        },
      });

      if (data.requestPasswordReset) {
        setIsLoading(false);
        setPasswordResetSuccess(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };
  return (
    <div className="modal-container">
      <>
        {passwordResetSuccess ? (
          <form>
            <h1>Reseteaste tu contraseña!</h1>
            <p>
              Ingresá a tu correo electrónico y clickeá en el link para resetear
              tu contraseña.
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1>Reseteá tu contraseña</h1>
            <p>
              Ingresá tu correo electrónico para que te mandemos un link para
              resetear tu contraseña.
            </p>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                className="small"
                id="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>
            <button disabled={!email} className="button button--large">
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <span>Mandar link a mi correo electrónico</span>
              )}
            </button>
          </form>
        )}
      </>
    </div>
  );
}
