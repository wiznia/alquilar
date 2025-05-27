'use client';

import { REGISTER } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { useAuth } from '@/components/AuthContext';
import { useState } from 'react';
import { useLocationData } from '@/app/hooks/useLocationData';
import Select from '@/components/Select';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleRegister } = useAuth();
  const initialState = {
    apellido: '',
    barrio: '',
    celular: null,
    condicion_fiscal: '',
    direccion: '',
    dni: null,
    email: '',
    localidad: '',
    nombre: '',
    password: '',
    provincia: '',
    telefono: null,
    terms: false,
    tipo_de_cuenta: '',
    usuario: '',
  };
  const {
    provinceData,
    cityData,
    localidadesData,
    setSelectedProvince,
    setSelectedCity,
    setSelectedLocalidad,
  } = useLocationData();
  const { form, errors, handleChange, validateFormCheck, setErrors } =
    useFormValidation(initialState, 'register', {
      setSelectedProvince,
      setSelectedCity,
      setSelectedLocalidad,
    });
  const [register] = useMutation(REGISTER);
  const router = useRouter();

  const handleRegisterSubmit = async () => {
    if (!validateFormCheck()) return;

    try {
      setIsLoading(true);
      const { data } = await register({
        variables: {
          ...form,
        },
      });

      if (data?.register?.token) {
        setIsLoading(false);
        await handleRegister(data.register.token);
        router.push('/account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        'Error en el inicio de sesión. Intentá de nuevo.';

      const newErrors = {};

      if (errorMessage.includes('User already exists')) {
        newErrors.usuario = 'Ya existe un usuario con este nombre, elegí otro.';
      } else if (errorMessage.includes('Email already exists')) {
        newErrors.email = 'El email ingresado ya existe en el sistema.';
      } else {
        newErrors.api = errorMessage;
      }

      setErrors(newErrors);
    }
  };

  return (
    <div className="modal-single-container">
      <h1>Registrá tu cuenta</h1>
      <p>
        ¿No estás seguro qué significan estas opciones? <br />
        Revisá nuestra sección de <Link href="/faqs">FAQs</Link>.
      </p>
      <fieldset>
        <label htmlFor="tipo_de_cuenta">Tipo de cuenta:</label>
        <select
          className="popover-button small"
          type="text"
          name="tipo_de_cuenta"
          id="tipo_de_cuenta"
          placeholder="Tipo de cuenta"
          required
          onChange={handleChange}
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
        {errors.tipo_de_cuenta && (
          <small className="error-message">{errors.tipo_de_cuenta}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="usuario">Usuario:</label>
        <input
          type="text"
          className="small"
          id="usuario"
          name="usuario"
          placeholder="Usuario"
          required
          onChange={handleChange}
        />
        {errors.usuario && (
          <small className="error-message">{errors.usuario}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          className="small"
          id="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        {errors.email && (
          <small className="error-message">{errors.email}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="contrasena">Contraseña:</label>
        <input
          type="password"
          className="small"
          id="contrasena"
          name="password"
          placeholder="Contraseña"
          required
          onChange={handleChange}
        />
        {errors.password && (
          <small className="error-message">{errors.password}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          className="small"
          id="nombre"
          name="nombre"
          placeholder="Nombre"
          required
          onChange={handleChange}
        />
        {errors.nombre && (
          <small className="error-message">{errors.nombre}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="apellido">Apellido:</label>
        <input
          type="text"
          className="small"
          id="apellido"
          name="apellido"
          placeholder="Apellido"
          required
          onChange={handleChange}
        />
        {errors.apellido && (
          <small className="error-message">{errors.apellido}</small>
        )}
      </fieldset>
      <fieldset>
        <div className="account__item">
          <div className="account__item-inner account__item-inner--half">
            <p>Provincia:</p>
            <Select
              name="provincia"
              placeholder="Provincia"
              resource="provincias"
              options={provinceData ? provinceData.provincias : []}
              onChange={handleChange}
              keyName="nombre"
            />
            {errors.provincia && (
              <small className="error-message">{errors.provincia}</small>
            )}
          </div>
        </div>
      </fieldset>
      <fieldset>
        <div className="account__item">
          <div className="account__item-inner account__item-inner--half">
            <p>Barrio:</p>
            <Select
              name="barrio"
              placeholder="Barrio"
              onChange={handleChange}
              options={cityData ? cityData.localidades : []}
              keyName="nombre"
            />
            {errors.barrio && (
              <small className="error-message">{errors.barrio}</small>
            )}
          </div>
        </div>
      </fieldset>
      {localidadesData?.length > 0 && (
        <fieldset>
          <div className="account__item">
            <div className="account__item-inner account__item-inner--half">
              <p>Municipio:</p>
              <Select
                name="municipio"
                placeholder="Municipio"
                resource="localidades"
                onChange={handleChange}
                options={localidadesData ? localidadesData : []}
                keyName="nombre"
              />
            </div>
          </div>
        </fieldset>
      )}
      <fieldset>
        <div className="account__item">
          <div className="account__item-inner account__item-inner--half">
            <p>Dirección:</p>
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              required
              onChange={handleChange}
            />
            {errors.direccion && (
              <small className="error-message">{errors.direccion}</small>
            )}
          </div>
        </div>
      </fieldset>
      <fieldset>
        <label htmlFor="condicion_fiscal">Condición fiscal:</label>
        <select
          className="popover-button small"
          type="text"
          id="condicion_fiscal"
          name="condicion_fiscal"
          placeholder="Condición fiscal"
          required
          onChange={handleChange}
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
        {errors.condicion_fiscal && (
          <small className="error-message">{errors.condicion_fiscal}</small>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="DNI">DNI:</label>
        <input
          type="number"
          className="small"
          id="DNI"
          name="dni"
          placeholder="DNI"
          required
          onChange={handleChange}
        />
        {errors.dni && <small className="error-message">{errors.dni}</small>}
      </fieldset>
      <fieldset>
        <label htmlFor="telefono">Teléfono:</label>
        <input
          type="tel"
          className="small"
          id="telefono"
          name="telefono"
          placeholder="Teléfono"
          onChange={handleChange}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="celular">Celular:</label>
        <input
          type="tel"
          className="small"
          id="celular"
          name="celular"
          placeholder="Celular"
          onChange={handleChange}
        />
      </fieldset>
      <fieldset className="terms">
        <div className="terms__inner">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            placeholder="Acepto los términos y condiciones de uso"
            required
            onChange={handleChange}
          />
          <label htmlFor="terms">
            Acepto los <a href="/">Términos y condiciones de uso</a>
          </label>
        </div>
        {errors.terms && (
          <small className="error-message">{errors.terms}</small>
        )}
      </fieldset>
      <button onClick={handleRegisterSubmit} className="button button--large">
        {isLoading ? (
          <span className="loader"></span>
        ) : (
          <span>Registrarse</span>
        )}
      </button>
    </div>
  );
}
