'use client';

import { useFormValidation } from '@/app/hooks/useFormValidation';
import AccountSidebar from '@/components/AccountSidebar';
import { useAuth } from '@/components/AuthContext';
import { UPDATE_USER } from '@/components/queries/queries';
import { useToast } from '@/components/ToastContext';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Settings() {
  const { user } = useAuth();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDeleteAccount] = useState(false);
  const { setForm, form, errors, handleChange, validateFormCheck } =
    useFormValidation(user, 'updateUser', 'updateUser');
  const [updateUser] = useMutation(UPDATE_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormCheck()) {
      return;
    }

    setIsLoading(true);
    const { __typename, documentation, id, ...sanitizedForm } = form;

    try {
      await updateUser({
        variables: {
          id: user?.id,
          input: {
            ...sanitizedForm,
          },
        },
      });

      setIsLoading(false);

      showToast('Actualizaste tus datos!');
    } catch (error) {
      showToast(`Hubo un error al actualizar tus datos: ${error}`, 'error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) setForm(user);
  }, [user, setForm]);

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <h6>Configuración general:</h6>
        <form>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Nombre:</p>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  required
                  onChange={handleChange}
                  value={form?.nombre || ''}
                />
                {errors.nombre && (
                  <small className="text-danger">{errors.nombre}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Apellido:</p>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  required
                  onChange={handleChange}
                  value={form?.apellido || ''}
                />
                {errors.apellido && (
                  <small className="text-danger">{errors.apellido}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Email:</p>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  onChange={handleChange}
                  value={form?.email || ''}
                />
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>DNI:</p>
                <input
                  type="number"
                  name="dni"
                  placeholder="DNI"
                  required
                  onChange={handleChange}
                  value={form?.dni || ''}
                />
                {errors.dni && (
                  <small className="text-danger">{errors.dni}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Teléfono:</p>
                <input
                  type="number"
                  name="telefono"
                  placeholder="Teléfono"
                  required
                  onChange={handleChange}
                  value={form?.telefono || ''}
                />
                {errors.telefono && (
                  <small className="text-danger">{errors.telefono}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Celular:</p>
                <input
                  type="number"
                  name="celular"
                  placeholder="Celular"
                  required
                  onChange={handleChange}
                  value={form?.celular || ''}
                />
                {errors.celular && (
                  <small className="text-danger">{errors.celular}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Condición fiscal:</p>
                <select
                  className="popover-button small"
                  name="condicion_fiscal"
                  id="condicion_fiscal"
                  placeholder="Condición fiscal"
                  required
                  onChange={handleChange}
                  value={form?.condicion_fiscal || ''}
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
                  <small className="text-danger">
                    {errors.condicion_fiscal}
                  </small>
                )}
              </div>
            </div>
          </fieldset>
          <div className="button-container">
            <button
              onClick={handleSubmit}
              type="submit"
              name="publish"
              className="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <span>Actualizar</span>
              )}
            </button>
          </div>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <h6>Eliminar cuenta:</h6>
                {user?.tipo_de_cuenta === 'Dueño' ? (
                  <p>
                    Vas a eliminar tu cuenta, se borrará todo el contenido
                    incluyendo tus mensajes en tu bandeja de entrada, tus
                    publicaciones, documentos y eventos que hayas configurado.
                  </p>
                ) : (
                  <p>
                    Vas a eliminar tu cuenta, se borrará todo el contenido
                    incluyendo tus mensajes en tu bandeja de entrada,
                    publicaciones guardadas en tu wishlist y eventos que hayas
                    configurado.
                  </p>
                )}
                <div className="button-container">
                  <Link
                    href={{
                      pathname: '/account/settings/deleteUser',
                      query: {
                        id: user?.id,
                      },
                    }}
                  >
                    <button
                      type="submit"
                      name="deleteUser"
                      className="button button--danger"
                      disabled={isLoadingDeleteAccount}
                    >
                      {isLoadingDeleteAccount ? (
                        <span className="loader"></span>
                      ) : (
                        <span>Eliminar cuenta</span>
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
