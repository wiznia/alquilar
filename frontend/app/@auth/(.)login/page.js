'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import Link from 'next/link';
import { LOGIN } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useMutation(LOGIN);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { data } = await login({ variables: { email, password } });
      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        router.push('/account');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Modal>
      <h1>Ingresá a tu cuenta</h1>
      <fieldset>
        <label htmlFor="usuario">Usuario:</label>
        <input
          type="text"
          className="small"
          id="usuario"
          placeholder="Usuario"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="contrasena">Contraseña:</label>
        <input
          type="password"
          className="small"
          id="contrasena"
          placeholder="Contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </fieldset>
      <Link href="/forgot">Olvidé mi contraseña</Link>
      <a onClick={handleLogin} className="button button--large">
        Ingresar
      </a>
    </Modal>
  );
}
