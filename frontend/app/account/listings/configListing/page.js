'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import {
  SINGLE_LISTING_QUERY,
  CONNECT_MERCADO_PAGO,
  DISCONNECT_MERCADO_PAGO,
  CREATE_PAYMENT_LINK,
  GET_TENANT_USER,
  ADD_POTENTIAL_TENANT,
} from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { useFormValidation } from '@/app/hooks/useFormValidation';

function ConfigListing() {
  const { user, refetchUser } = useAuth();
  const id = useSearchParams().get('id');
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const [paymentLink, setPaymentLink] = useState('');
  const [connectMercadoPago] = useMutation(CONNECT_MERCADO_PAGO);
  const [disconnectMercadoPago] = useMutation(DISCONNECT_MERCADO_PAGO);
  const [addPotentialTenant] = useMutation(ADD_POTENTIAL_TENANT);
  const [createPaymentLink] = useMutation(CREATE_PAYMENT_LINK);
  const { form, setForm, errors, handleChange, validateFormCheck } =
    useFormValidation(data?.getListingById, 'sendSena');
  const [
    findTenants,
    { data: tenantData, loading: tenantLoading, error: tenantError },
  ] = useLazyQuery(GET_TENANT_USER);

  const handleConnectMercadoPago = async () => {
    try {
      const { data } = await connectMercadoPago({
        variables: { userId: user?.id },
      });
      const mercadoPagoUrl = data.connectMercadoPago;

      if (mercadoPagoUrl) {
        const popup = window.open(
          mercadoPagoUrl,
          'mercadoPagoPopup',
          'width=500,height=600',
        );

        const popupInterval = setInterval(async () => {
          if (popup && popup.closed) {
            clearInterval(popupInterval);
            await refetchUser();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error conectando con Mercado Pago:', error.message);
    }
  };

  const handleDisconnectMercadoPago = async () => {
    try {
      await disconnectMercadoPago({
        variables: {
          userId: user?.id,
        },
      });
      await refetchUser();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!validateFormCheck()) {
      return;
    }
    try {
      const { data } = await createPaymentLink({
        variables: { userId: user?.id, value: parseFloat(form.sena) },
      });
      setPaymentLink(data.createPaymentLink);
      await refetchUser();
    } catch (error) {
      console.error('Error creating payment link:', error.message);
    }
  };

  const handleAddPotentialTenant = async (userId) => {
    try {
      const { data } = await addPotentialTenant({
        variables: { userId: userId, listingId: id },
      });
    } catch (error) {
      console.error('Error agregando potencial inquilino:', error.message);
    }
  };

  useEffect(() => {
    if (user) {
      setForm((prevForm) => ({
        ...prevForm,
        sena: user.sena,
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <Loading>
        <h4>Cargando publicación...</h4>
      </Loading>
    );
  }

  if (error) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar el listado de publicaciones:
          {error.message}
        </p>
      </Loading>
    );
  }

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <Breadcrumb
          direccion={data?.getListingById?.direccion}
          title={user?.tipo_de_cuenta === 'Dueño' ? 'inmuebles' : 'alquileres'}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} />
        <div className="account__info-inner">
          <h6>Agregar usuarios como potenciales inquilinos:</h6>
          <p>
            Los usuarios que agregues como potenciales inquilinos van a poder
            acceder a la configuración de este inmueble incluyendo tu
            documentación e información general del inmueble como el valor de la
            seña o tu CBU o alias.
          </p>
          <div className="input-suggestion">
            <input
              type="text"
              name="inquilino"
              value={form?.inquilino || ''}
              onChange={(e) => {
                handleChange(e);
                findTenants({
                  variables: {
                    usuario: e.target.value,
                    tipo_de_cuenta: 'Inquilino',
                  },
                });
              }}
              placeholder="Ingresá el nombre del usuario para agregarlo como potencial inquilino"
            />
            {tenantData?.getTenantUser?.length > 0 && (
              <div className="input-suggestion__container">
                {tenantData?.getTenantUser.map((tenant, i) => (
                  <div key={i} className="input-suggestion__item">
                    <small>
                      {tenant.nombre} {tenant.apellido}
                    </small>
                    <button
                      className="button button--small"
                      onClick={() => handleAddPotentialTenant(tenant.id)}
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="account__info-inner">
          {user?.mercadoPago?.userId === null || user?.sena === null ? (
            <>
              <h6>Configurar valor de seña:</h6>
              <p>
                Podés recibir el pago de la seña de tu inmueble directamente en
                tu cuenta de Mercado Pago. Clickeá en "Conectar cuenta" e
                ingresá el valor de la seña en pesos argentinos.
              </p>
              <input
                type="number"
                name="sena"
                value={form?.sena || ''}
                onChange={handleChange}
                placeholder="Ingresá el monto de la seña en pesos argentinos"
              />
            </>
          ) : (
            <>
              <h6>Seña:</h6>
              <p>Este es el valor de tu seña en pesos argentinos.</p>
            </>
          )}
          {user?.mercadoPago.userId !== null && (
            <>
              <input
                type="number"
                name="sena"
                value={form?.sena || ''}
                onChange={handleChange}
                placeholder="Ingresá el monto de la seña en pesos argentinos"
              />
              {errors.sena && (
                <small className="error-message">{errors.sena}</small>
              )}
            </>
          )}
        </div>
        <div className="button-container">
          {user?.mercadoPago.userId !== null && (
            <button className="button" onClick={handleCreatePaymentLink}>
              Guardar
            </button>
          )}
          {user?.mercadoPago?.userId === null ? (
            <button className="button" onClick={handleConnectMercadoPago}>
              Conectar cuenta
            </button>
          ) : (
            <button
              className="button button--secondary"
              onClick={handleDisconnectMercadoPago}
            >
              Desconectar cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConfigListing />
    </Suspense>
  );
}
