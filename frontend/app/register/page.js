'use client';

import { useEffect, useState } from 'react';
import { REGISTER } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function Page() {
  const [tipoDeCuenta, setTipoDeCuenta] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [condicionFiscal, setCondicionFiscal] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [celular, setCelular] = useState('');
  const [terms, setTerms] = useState(false);
  const [register] = useMutation(REGISTER);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/login');
    }
  }, [user]);

  const handleRegister = async () => {
    try {
      const { data } = await register({
        variables: {
          tipo_de_cuenta: tipoDeCuenta,
          email,
          password,
          nombre,
          apellido,
          usuario,
          condicion_fiscal: condicionFiscal,
          dni: parseInt(dni, 10),
          telefono: telefono ? parseInt(telefono, 10) : null,
          celular: celular ? parseInt(celular, 10) : null,
        },
      });
      if (data?.register?.token) {
        localStorage.setItem('token', data.register.token);
        router.push('/account');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="modal-container">
      <h1>Registrá tu cuenta</h1>
      <fieldset>
        <label htmlFor="tipo_de_cuenta">Tipo de cuenta:</label>
        <select
          className="popover-button small"
          type="text"
          id="tipo_de_cuenta"
          placeholder="Tipo de cuenta"
          required
          value={tipoDeCuenta}
          onChange={(e) => setTipoDeCuenta(e.target.value)}
        >
          <button>
            <selectedcontent></selectedcontent>
            <span className="arrow"></span>
          </button>
          <option value="" hidden>
            <span>Tipo de cuenta</span>
          </option>
          <option>Inquilino</option>
          <option>Dueño</option>
          <option>Escribano</option>
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="email">Usuario:</label>
        <input
          type="text"
          className="small"
          id="usuario"
          placeholder="Usuario"
          required
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          className="small"
          id="email"
          placeholder="Email"
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
      <fieldset>
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          className="small"
          id="nombre"
          placeholder="Nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="apellido">Apellido:</label>
        <input
          type="text"
          className="small"
          id="apellido"
          placeholder="Apellido"
          required
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="condicion_fiscal">Condición fiscal:</label>
        <select
          className="popover-button small"
          type="text"
          id="condicion_fiscal"
          placeholder="Condición fiscal"
          required
          value={condicionFiscal}
          onChange={(e) => setCondicionFiscal(e.target.value)}
        >
          <button>
            <selectedcontent></selectedcontent>
            <span className="arrow"></span>
          </button>
          <option value="" hidden>
            <span>Condición fiscal</span>
          </option>
          <option>Consumidor final</option>
          <option>Monotributista</option>
          <option>Responsable Inscripto</option>
          <option>Exento</option>
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="DNI">DNI:</label>
        <input
          type="number"
          className="small"
          id="DNI"
          placeholder="DNI"
          required
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="telefono">Teléfono:</label>
        <input
          type="tel"
          className="small"
          id="telefono"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="celular">Celular:</label>
        <input
          type="tel"
          className="small"
          id="celular"
          placeholder="Celular"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
        />
      </fieldset>
      <fieldset className="terms">
        <input
          type="checkbox"
          id="terms"
          placeholder="Acepto los términos y condiciones de uso"
          required
          onChange={() => setTerms(!terms)}
        />
        <label htmlFor="terms">
          Acepto los <a href="/">Términos y condiciones de uso</a>
        </label>
      </fieldset>
      <a onClick={handleRegister} className="button button--large">
        Registrarse
      </a>
    </div>
  );
}
