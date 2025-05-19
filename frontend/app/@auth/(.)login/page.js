'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { LOGIN } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { useAuth } from '@/components/AuthContext';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, setCookie } = useAuth();
  const initialState = {
    email: '',
    password: '',
  };
  const [showPassword, setShowPassword] = useState(false);
  const { form, errors, handleChange, validateFormCheck, setErrors } =
    useFormValidation(initialState, 'login');
  const [loginMutation] = useMutation(LOGIN);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateFormCheck()) return;

    try {
      const { data } = await loginMutation({ variables: { ...form } });

      setIsLoading(true);

      if (data?.login?.token) {
        setIsLoading(false);
        setCookie('authToken', data.login.token, 7);
        await login();
        router.push('/account/settings');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        'Error en el inicio de sesión. Intentá de nuevo.';

      const newErrors = {};

      if (errorMessage.includes('User not found')) {
        newErrors.email = 'El email no está registrado.';
      } else if (errorMessage.includes('Invalid password')) {
        newErrors.password = 'La contraseña es incorrecta.';
      } else {
        newErrors.api = errorMessage;
      }

      setErrors(newErrors);
    }
  };

  return (
    <Modal>
      <form onSubmit={handleLogin}>
        <h1>Ingresá a tu cuenta</h1>
        {errors.api && !errors.email && !errors.password && (
          <small className="error-message">{errors.api}</small>
        )}
        <fieldset>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            className="small required"
            id="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          {errors.email && (
            <small className="error-message">{errors.email}</small>
          )}
        </fieldset>
        <fieldset>
          <label htmlFor="contrasena">Contraseña:</label>
          <div className="input-password">
            <input
              type={showPassword ? 'text' : 'password'}
              className="small required"
              id="contrasena"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
            />
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 28 28"
                onClick={() => setShowPassword(!showPassword)}
              >
                <path
                  fill="#737373"
                  fillRule="evenodd"
                  d="M17.747 15.415c.238-.54.372-1.143.372-1.413 0-2.348-1.824-4.25-4.073-4.25-2.25 0-4.073 1.902-4.073 4.25 0 2.347 2.037 3.887 4.073 3.887 1.303 0 2.462-.637 3.206-1.63a4.29 4.29 0 0 0 .495-.844Zm-3.701.349c.51 0 .975-.196 1.332-.518.432-.39.622-.965.622-1.244 0-1.174-.828-2.126-1.954-2.126-1.125 0-2.046.95-2.046 2.124 0 .81.92 1.764 2.046 1.764Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#737373"
                  fillRule="evenodd"
                  d="M1.092 14.272a.448.448 0 0 1 0-.545c.01-.012.019-.025.028-.039C4.78 8.343 9.32 5.5 14.014 5.5c4.689 0 9.224 2.836 12.882 8.17.069.101.104.205.104.33 0 .13-.04.24-.114.346C23.23 19.67 18.698 22.5 14.014 22.5c-4.705 0-9.257-2.857-12.922-8.228Zm2.847-.92a1.04 1.04 0 0 0 0 1.294c3.135 3.898 6.665 5.729 10.075 5.729 3.41 0 6.94-1.83 10.075-5.729a1.04 1.04 0 0 0 0-1.294c-3.135-3.897-6.665-5.727-10.075-5.727-3.41 0-6.94 1.83-10.075 5.727Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 28 28"
                onClick={() => setShowPassword(!showPassword)}
              >
                <path
                  fill="#737373"
                  fillRule="evenodd"
                  d="M22.693 1.55a.794.794 0 0 0-1.093.297l-2.447 4.297c-1.667-.78-3.392-1.18-5.139-1.18-4.693 0-9.233 2.882-12.894 8.3l-.015.021-.012.019a.46.46 0 0 0 0 .552c2.7 4.013 5.884 6.641 9.255 7.746L8.4 25.022a.817.817 0 0 0 .293 1.108l.347.203a.794.794 0 0 0 1.092-.297L23.332 2.86a.817.817 0 0 0-.293-1.108l-.346-.203Zm-4.601 6.457c-1.357-.597-2.727-.888-4.078-.888-3.41 0-6.94 1.854-10.075 5.805-.3.38-.3.932 0 1.311 2.35 2.962 4.922 4.746 7.499 5.454l1.348-2.366c-1.54-.49-2.813-1.86-2.813-3.741 0-2.38 1.824-4.308 4.073-4.308 1.038 0 1.986.41 2.705 1.087l1.341-2.354Zm-2.453 4.307c-.346-.537-.916-.886-1.593-.886-1.125 0-2.046.963-2.046 2.152 0 .786.843 1.705 1.902 1.782l1.737-3.048Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#737373"
                  d="M14.687 22.176c4.444-.261 8.719-3.107 12.2-8.245A.605.605 0 0 0 27 13.58a.571.571 0 0 0-.104-.335c-1.338-1.977-2.794-3.616-4.33-4.9l-1.06 1.86c.883.76 1.747 1.665 2.583 2.719.301.38.301.932 0 1.311-2.521 3.178-5.299 5-8.064 5.592l-1.338 2.35Z"
                />
              </svg>
            )}
          </div>
          {errors.password && (
            <small className="error-message">{errors.password}</small>
          )}
        </fieldset>
        <Link href="/forgot">Olvidé mi contraseña</Link>
        <button className="button button--large">
          {isLoading ? <span className="loader"></span> : <span>Ingresar</span>}
        </button>
      </form>
    </Modal>
  );
}
