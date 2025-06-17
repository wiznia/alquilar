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
  GET_POTENTIAL_TENANTS_BY_LISTING,
  REMOVE_POTENTIAL_TENANT,
  UPDATE_LISTING,
} from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import Loading from '@/components/Loading';
import { Suspense, useCallback, useEffect, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import throttle from '@/lib/throttle';
import { usePathname } from 'next/navigation';
import removeTypename from '@/lib/removeTypename';
import { useToast } from '@/components/ToastContext';

function ConfigListing() {
  const { user } = useAuth();
  const showToast = useToast();
  const id = useSearchParams().get('id');
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const [paymentLink, setPaymentLink] = useState('');
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [isLoadingMP, setIsLoadingMP] = useState(false);
  const [isLoadingCBU, setIsLoadingCBU] = useState(false);
  const [isLoadingSena, setIsLoadingSena] = useState(false);
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);
  const [shouldFetchPotentialTenants, setShouldFetchPotentialTenants] =
    useState(false);
  const [connectMercadoPago] = useMutation(CONNECT_MERCADO_PAGO);
  const [disconnectMercadoPago] = useMutation(DISCONNECT_MERCADO_PAGO);
  const [addPotentialTenant] = useMutation(ADD_POTENTIAL_TENANT);
  const [removePotentialTenant] = useMutation(REMOVE_POTENTIAL_TENANT);
  const [createPaymentLink] = useMutation(CREATE_PAYMENT_LINK);
  const [updateListing, { loading: updateLoading }] =
    useMutation(UPDATE_LISTING);
  const { form, setForm, errors, handleChange, validateFormCheck } =
    useFormValidation(data?.getListingById, 'sendSena');
  const [
    findTenants,
    { data: tenantData, loading: tenantLoading, error: tenantError },
  ] = useLazyQuery(GET_TENANT_USER);
  const {
    data: dataPotentialTenants,
    loading: loadingPotentialTenants,
    error: errorPotentialTenants,
  } = useQuery(GET_POTENTIAL_TENANTS_BY_LISTING, {
    variables: {
      ids: data?.getListingById?.potential_tenant,
    },
    skip: !shouldFetchPotentialTenants,
  });
  const throttledFindTenants = useCallback(
    throttle((variables) => {
      findTenants({ variables });
    }, 2000),
    [findTenants],
  );

  const handleConnectMercadoPago = async () => {
    try {
      const { data } = await connectMercadoPago({
        variables: { listingId: id },
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
            await refetch();
            showToast('Conectaste tu cuenta de Mercado Pago!');
          }
        }, 500);
      }
    } catch (error) {
      showToast(
        `Hubo un error al conectar tu cuenta de Mercado Pago: ${error}`,
        'error',
      );
      console.error('Error conectando con Mercado Pago:', error.message);
    }
  };

  const handleDisconnectMercadoPago = async () => {
    try {
      await disconnectMercadoPago({
        variables: {
          listingId: id,
        },
      });
      await refetch();
      showToast('Desonectaste tu cuenta de Mercado Pago!');
    } catch (error) {
      showToast(
        `Hubo un error al desconectar tu cuenta de Mercado Pago: ${error}`,
        'error',
      );
      console.error('Error deleting listing:', error);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!validateFormCheck()) {
      return;
    }
    setIsLoadingMP(true);
    try {
      const { data } = await createPaymentLink({
        variables: {
          userId: user?.id,
          value: parseFloat(form.sena),
          listingId: id,
        },
      });
      setPaymentLink(data.createPaymentLink);
      setIsLoadingMP(false);
      if (data?.getListingById?.mpPaymentLink !== undefined) {
        showToast('Vinculaste tu cuenta de Mercado Pago!');
      }
      await refetch();
    } catch (error) {
      showToast(
        `Hubo un error al vincular tu cuenta de Mercado Pago: ${error}`,
        'error',
      );
      console.error('Error creating payment link:', error.message);
      setIsLoadingMP(false);
    }
  };

  const handleAddPotentialTenant = async (tenantId) => {
    if (!validateFormCheck()) {
      return;
    }

    try {
      await addPotentialTenant({
        variables: {
          tenantId,
          listingId: id,
          senderId: user?.id,
          receiverId: tenantId,
          type: 'listing',
        },
      });
      setSearchIsActive(false);
      showToast('Agregaste un potencial inquilino al inmueble!');
      refetch();
    } catch (error) {
      console.error('Error agregando potencial inquilino:', error.message);
      showToast(
        `Hubo un error al agregar un potencial inquilino: ${error}`,
        'error',
      );
      setSearchIsActive(false);
    }
  };

  const handleRemovePotentialTenant = async (tenantId) => {
    if (!validateFormCheck()) {
      return;
    }

    try {
      await removePotentialTenant({
        variables: {
          listingId: id,
          senderId: user?.id,
          receiverId: tenantId,
          type: 'listing',
        },
      });
      refetch();
      showToast('Removiste a un potencial inquilino al inmueble!');
    } catch (error) {
      showToast(
        `Hubo un error al remover al potencial inquilino: ${error}`,
        'error',
      );
      console.error('Error removiendo potencial inquilino:', error.message);
    }
  };

  const handleAddCBU = async () => {
    const cleanedForm = removeTypename(form);

    if (!validateFormCheck(undefined, 'addCBU')) {
      return;
    }
    setIsLoadingCBU(true);

    try {
      await updateListing({
        variables: {
          id,
          input: {
            payment: {
              cbu: cleanedForm.payment.cbu,
            },
          },
          senderId: user?.id,
        },
      });
      setIsLoadingCBU(false);
      showToast('Agregaste tu CBU al inmueble!');
    } catch (error) {
      console.error('Error agregando cbu:', error.message);
      showToast(
        `Hubo un error al agregar el CBU a tu inmueble: ${error}`,
        'error',
      );
      setIsLoadingCBU(false);
    }
  };

  const handleAddSena = async () => {
    const cleanedForm = removeTypename(form);

    if (!validateFormCheck(undefined, 'sendSena')) {
      return;
    }
    setIsLoadingSena(true);

    try {
      await updateListing({
        variables: {
          id,
          input: {
            sena: cleanedForm.sena,
          },
          senderId: user?.id,
        },
      });

      if (data?.getListingById?.mercadoPago?.userId) {
        handleCreatePaymentLink();
      }
      setIsLoadingSena(false);
      showToast('Agregaste una seña a tu inmueble!');
      refetch();
    } catch (error) {
      console.error('Error agregando seña:', error.message);
      showToast(
        `Hubo un error al agregar la seña a tu inmueble: ${error}`,
        'error',
      );
      setIsLoadingSena(false);
    }
  };

  const handleConfirmSignature = async () => {
    setIsLoadingSignature(true);

    try {
      await updateListing({
        variables: {
          id,
          input: {
            signature: !form.signature,
          },
          senderId: user?.id,
        },
      });
      setIsLoadingSignature(false);
      showToast('El inmueble fue alquilado, felicidades!');
      await refetch();
    } catch (error) {
      console.error('Error confirmando la firma de contrato:', error.message);
      showToast(
        `Hubo un error al confirmar la firma de contrato: ${error}`,
        'error',
      );
      setIsLoadingSignature(false);
    }
  };

  useEffect(() => {
    if (
      data?.getListingById?.potential_tenant &&
      data.getListingById.potential_tenant.length > 0
    ) {
      setShouldFetchPotentialTenants(true);
    } else {
      setShouldFetchPotentialTenants(false);
    }
  }, [data?.getListingById?.potential_tenant]);

  useEffect(() => {
    if (user && data?.getListingById) {
      setForm(() => ({
        sena: data.getListingById.sena,
        payment: {
          cbu: data.getListingById.payment.cbu,
        },
        signature: data.getListingById.signature,
      }));
    }
  }, [user, data?.getListingById]);

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
          Hubo un problema al cargar la publicación:
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
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} />
        {data?.getListingById?.signature !== true ? (
          <>
            <div className="account__info-inner">
              <h6>Agregar usuarios como potenciales inquilinos:</h6>
              <p>
                Los usuarios que agregues como potenciales inquilinos van a
                poder acceder a la configuración de este inmueble incluyendo tu
                documentación e información general del inmueble como el valor
                de la seña o tu CBU o alias.
              </p>
              <div className="input-suggestion">
                <input
                  type="text"
                  name="inquilino"
                  value={form?.inquilino || ''}
                  onChange={(e) => {
                    handleChange(e);
                    setSearchIsActive(true);
                    throttledFindTenants({
                      nombre: e.target.value,
                      apellido: e.target.value,
                      tipo_de_cuenta: 'Inquilino',
                      potential_tenant: [id],
                    });
                  }}
                  placeholder="Ingresá el nombre o apellido del usuario para agregarlo como potencial inquilino"
                />
                {tenantData?.getTenantUser?.length > 0 && searchIsActive && (
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
            {dataPotentialTenants?.getPotentialTenantsByListing?.length > 0 && (
              <div className="account__info-inner">
                <h6>Permisos de usuarios:</h6>
                <p>
                  Los siguientes usuarios son potenciales inquilinos y pueden
                  ver todo lo relacionado a este inmueble. A su vez, vas a poder
                  ver toda su documentación necesaria para poder alquilar.
                </p>
                <p>
                  Si removés a un usuario dejarás de tener acceso a la
                  documentación y no podrán ver la tuya tampoco.
                </p>
                {dataPotentialTenants.getPotentialTenantsByListing.map(
                  (tenant, i) => (
                    <div className="account__info-ownership-item" key={i}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="39"
                        fill="none"
                      >
                        <rect
                          width="39"
                          height="38"
                          x=".074"
                          y=".457"
                          fill="#FF9500"
                          rx="19"
                        />
                        <path
                          fill="#FAFAFA"
                          d="M19.574 17.957a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9ZM10.074 27.707v1.125c0 .298.125.584.348.796.223.21.525.329.84.329h16.625c.315 0 .617-.119.84-.33.222-.21.347-.497.347-.795v-1.125c0-1.79-.75-3.507-2.087-4.773-1.336-1.266-3.148-1.977-5.038-1.977H17.2c-1.89 0-3.702.711-5.038 1.977-1.336 1.266-2.087 2.983-2.087 4.773Z"
                        />
                      </svg>
                      <small>
                        {tenant.nombre} {tenant.apellido}
                      </small>
                      <button
                        className="button button--small"
                        onClick={() => handleRemovePotentialTenant(tenant.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
            {data?.getListingById?.sena === null && (
              <div className="account__info-inner">
                <h6>Configurar valor de seña:</h6>
                <p>
                  Ingresá el valor de la seña que querés cobrar para reservar tu
                  inmueble.
                </p>
                <input
                  type="number"
                  name="sena"
                  value={form?.sena || ''}
                  onChange={handleChange}
                  placeholder="Ingresá el monto de la seña en pesos argentinos"
                />
                {errors.sena && (
                  <small className="text-danger">{errors.sena}</small>
                )}
                <div className="button-container">
                  <button
                    className="button"
                    onClick={handleAddSena}
                    disabled={isLoadingSena}
                  >
                    {isLoadingSena ? (
                      <span className="loader"></span>
                    ) : (
                      <span>Configurar seña</span>
                    )}
                  </button>
                </div>
              </div>
            )}
            {data?.getListingById?.sena !== null && (
              <>
                <div className="account__info-inner">
                  <h6>Seña:</h6>
                  <p>Este es el valor de tu seña en pesos argentinos.</p>
                  <input
                    type="number"
                    name="sena"
                    value={form?.sena || ''}
                    onChange={handleChange}
                    placeholder="Ingresá el monto de la seña en pesos argentinos"
                  />
                  {errors.sena && (
                    <small className="text-danger">{errors.sena}</small>
                  )}
                  <div className="button-container">
                    <button
                      className="button"
                      onClick={handleAddSena}
                      disabled={isLoadingSena}
                    >
                      {isLoadingSena ? (
                        <span className="loader"></span>
                      ) : (
                        <span>Actualizar seña</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="account__info-inner">
                  <h6>Recibí tu seña directo en tu cuenta de Mercado Pago:</h6>
                  <p>
                    Podés recibir el pago de la seña de tu inmueble directamente
                    en tu cuenta de Mercado Pago. Clickeá en "Conectar cuenta"
                    para poder vincularla.
                  </p>
                  <div className="button-container">
                    {data?.getListingById?.mercadoPago?.userId ? (
                      <>
                        {!data?.getListingById?.mpPaymentLink && (
                          <button
                            className="button"
                            onClick={handleCreatePaymentLink}
                          >
                            {isLoadingMP ? (
                              <span className="loader"></span>
                            ) : (
                              <span>Vincular seña a Mercado Pago</span>
                            )}
                          </button>
                        )}
                        <button
                          className="button button--secondary"
                          onClick={handleDisconnectMercadoPago}
                        >
                          Desconectar cuenta
                        </button>
                      </>
                    ) : (
                      <button
                        className="button"
                        onClick={handleConnectMercadoPago}
                      >
                        Conectar cuenta
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="account__info-inner">
              <h6>Configurar CBU:</h6>
              <p>
                Si preferís manejar todo por transferencia bancaria, ingresá tu
                CBU en el campo siguiente.
              </p>
              <input
                type="text"
                name="payment.cbu"
                onChange={handleChange}
                placeholder="Ingresá el CBU de 22 dígitos"
                value={form?.payment?.cbu || ''}
              />
              {errors['payment.cbu'] && (
                <small className="text-danger">{errors['payment.cbu']}</small>
              )}
              <div className="button-container">
                <button
                  className="button"
                  onClick={handleAddCBU}
                  disabled={isLoadingCBU}
                >
                  {isLoadingCBU ? (
                    <span className="loader"></span>
                  ) : (
                    <span>
                      {data?.getListingById?.payment?.cbu
                        ? 'Actualizar'
                        : 'Configurar'}{' '}
                      CBU
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="account__info-inner">
              <h6>Firma del contrato:</h6>
              <p>
                Una vez que hayas firmado el contrato, Clickeá en "Confirmar
                firma". Esta operación es definitiva. Una vez que confirmes la
                firma de contrato no podrás volver atrás. El inmueble no podrá
                volver a ser editado ni configurado y vas a poder ver toda la
                información del alquiler vigente.
              </p>
              <div className="button-container">
                <button
                  className="button"
                  onClick={handleConfirmSignature}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <span className="loader"></span>
                  ) : (
                    'Confirmar firma'
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="account__info-inner">
              <h6>Rescindir contrato</h6>
              <p>
                Si el inquilino tuvo un uso irregular o indebido, abandono o
                deuda, podés rescindir el contrato de manera unilateral. Indicá
                el motivo de la rescisión:
              </p>
              <fieldset className="radio">
                <div className="account__item">
                  <div className="account__item-inner">
                    <input
                      type="radio"
                      name="motivo_rescision"
                      onChange={handleChange}
                      value="Uso indebido"
                      id="uso-indebido"
                    />
                    <label htmlFor="uso-indebido">Uso indebido</label>
                  </div>
                </div>
                <div className="account__item-inner">
                  <input
                    type="radio"
                    name="motivo_rescision"
                    onChange={handleChange}
                    value="Abandono"
                    id="abandono"
                  />
                  <label htmlFor="abandono">Abandono</label>
                </div>
                <div className="account__item-inner">
                  <input
                    type="radio"
                    name="motivo_rescision"
                    onChange={handleChange}
                    value="Deuda"
                    id="deuda"
                  />
                  <label htmlFor="deuda">Deuda</label>
                </div>
                <div className="account__item-inner">
                  <input
                    type="radio"
                    name="motivo_rescision"
                    onChange={handleChange}
                    value="Otros"
                    id="otros"
                  />
                  <label htmlFor="otros">Otros</label>
                </div>
              </fieldset>
              <textarea
                name="Nota al inquilino"
                placeholder="Nota al inquilino"
                onChange={handleChange}
                value={form?.note || ''}
              ></textarea>
              <div className="button-container">
                <button className="button button--danger">
                  Rescindir contrato
                </button>
              </div>
            </div>
          </>
        )}
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
