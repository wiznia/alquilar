'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LOGIN } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import Icon from '@/components/Icon';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, setCookie } = useAuth();
  const showToast = useToast();
  const initialState = {
    email: '',
    password: '',
  };
  const [showPassword, setShowPassword] = useState(false);
  const { form, errors, handleChange, validateFormCheck, setErrors } =
    useFormValidation(initialState, 'login');
  const [loginMutation] = useMutation(LOGIN);
  const router = useRouter();
  const inputRef = useRef(null);

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
        showToast(`Hola, ${data.login.nombre}!`);
        router.back();
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

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="modal-single-container">
      <form onSubmit={handleLogin}>
        <h1>Ingresá a tu cuenta</h1>
        {errors.api && !errors.email && !errors.password && (
          <small className="text-danger">{errors.api}</small>
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
            ref={inputRef}
          />
          {errors.email && (
            <small className="text-danger">{errors.email}</small>
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
            <Icon
              name={showPassword ? 'eye' : 'eyeOff'}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          {errors.password && (
            <small className="text-danger">{errors.password}</small>
          )}
        </fieldset>
        <Link href="/forgot">Olvidé mi contraseña</Link>
        <button className="button button--large">
          {isLoading ? <span className="loader"></span> : <span>Ingresar</span>}
        </button>
      </form>
    </div>
  );
}
