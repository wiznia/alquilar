'use client';

import { useFormValidation } from '@/app/hooks/useFormValidation';
import { Suspense, useEffect, useState } from 'react';
import { useLocationData } from '@/app/hooks/useLocationData';
import Select from '@/components/Select';
import AccountSidebar from '@/components/AccountSidebar';
import InlineNav from '@/components/InlineNav';
import Breadcrumb from '@/components/Breadcrumb';
import { useMutation, useQuery } from '@apollo/client';
import {
  GENERATE_CONTRACT,
  GET_POTENTIAL_TENANTS_BY_LISTING,
  SINGLE_LISTING_QUERY,
} from '@/components/queries/queries';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';

function GenerateContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [inquilinoSelect, setInquilinoSelect] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const { user } = useAuth();
  const showToast = useToast();
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const id = useSearchParams().get('id');
  const {
    provinceData,
    setSelectedProvince,
    setSelectedCity,
    setSelectedLocalidad,
  } = useLocationData();
  const initialState = {
    adjustmentMethod: '',
    adjustmentType: '',
    apellido: '',
    apellidoTenant: '',
    bankAccount: '',
    bankName: '',
    cbu: null,
    contractSignDate: '',
    contractStartDate: '',
    cuit: '',
    direccion: '',
    direccionTenant: '',
    dni: null,
    DNITenant: null,
    duracion: '',
    guaranteeType: '',
    inventory: '',
    listingAddress: '',
    listingCity: '',
    listingMoneda: '',
    listingPrice: '',
    nombre: '',
    nombreTenant: '',
    provincia: '',
    provinciaTenant: '',
  };
  const { form, setForm, errors, setErrors, handleChange, validateFormCheck } =
    useFormValidation(initialState, 'generateContract', 'generateContract', {
      setSelectedProvince,
      setSelectedCity,
      setSelectedLocalidad,
    });
  const { data } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const {
    data: tenantData,
    loading: tenantLoading,
    error: tenantError,
  } = useQuery(GET_POTENTIAL_TENANTS_BY_LISTING, {
    variables: {
      ids: data?.getListingById?.potential_tenant,
    },
    skip: !data?.getListingById?.potential_tenant,
  });
  const [generateContract] = useMutation(GENERATE_CONTRACT);

  const handleGenerateContract = async () => {
    if (!validateFormCheck()) return;

    try {
      const { potential_tenant, inquilino, ...sanitizedForm } = form;
      setIsLoading(true);
      const { data } = await generateContract({
        variables: { input: sanitizedForm, listingId: id },
      });
      const contractUrl = data.generateContract;
      setContractUrl(contractUrl);
      showToast('Generaste tu contrato de alquiler!');
      setIsLoading(false);
    } catch (error) {
      console.error('No se pudo generar el contrato:', error);
      showToast(
        `Ocurrió un error al intentar generar tu contrato de alquiler: ${error}`,
        'error',
      );
      setIsLoading(false);
    }
  };

  const handleSetInquilino = (e) => {
    const selectedId =
      e.target.options[e.target.options.selectedIndex].dataset.id;
    setForm((prevForm) => ({
      ...prevForm,
      inquilino: selectedId,
    }));
    setInquilinoSelect(selectedId);
  };

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      nombre: user?.nombre,
      apellido: user?.apellido,
      dni: user?.dni,
      provincia: user?.provincia,
      direccion: user?.direccion,
      cbu: data?.getListingById?.payment?.cbu,
      listingAddress: data?.getListingById.direccion,
      listingCity: data?.getListingById.provincia,
      listingMoneda: data?.getListingById.moneda,
      listingPrice: data?.getListingById.precio,
      potential_tenant: data?.getListingById.potential_tenant,
    }));
  }, [user, data]);

  useEffect(() => {
    if (!inquilinoSelect) return;

    const filteredData = tenantData?.getPotentialTenantsByListing.filter(
      (data) => data.id === inquilinoSelect,
    );

    if (filteredData && filteredData.length > 0) {
      setForm((prevForm) => ({
        ...prevForm,
        nombreTenant: filteredData[0]?.nombre,
        apellidoTenant: filteredData[0]?.apellido,
        DNITenant: filteredData[0]?.dni,
        provinciaTenant: filteredData[0]?.provincia,
        direccionTenant: filteredData[0]?.direccion,
      }));
    }
  }, [inquilinoSelect, tenantData, setForm]);

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <Breadcrumb
          direccion={data?.getListingById?.direccion}
          title="inmuebles"
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} />
        {!contractUrl ? (
          <>
            <div className="account__info-inner">
              <h6>Generá tu contrato de alquiler:</h6>
              <p>
                Completá tus datos y los del inquilino para generar tu contrato
                en PDF.
              </p>
              <fieldset>
                <label htmlFor="provincia">Elegí el inquilino</label>
                <select
                  name="inquilino"
                  placeholder="Elegí el inquilino"
                  resource="inquilino"
                  className="popover-button small"
                  options={
                    tenantData ? tenantData.getPotentialTenantsByListing : []
                  }
                  onChange={handleSetInquilino}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Elegí el inquilino</span>
                  </option>
                  {tenantData?.getPotentialTenantsByListing?.map(
                    (option, i) => (
                      <option
                        data-id={option.id}
                        key={i}
                      >{`${option.nombre} ${option.apellido}`}</option>
                    ),
                  )}
                </select>
                {errors.inquilino && (
                  <small className="text-danger">{errors.inquilino}</small>
                )}
              </fieldset>
            </div>
            <div className="account__info-subinner">
              <h6>Tus datos:</h6>
              <fieldset>
                <label htmlFor="nombre">Tu nombre:</label>
                <input
                  type="text"
                  className="small"
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  required
                  onChange={handleChange}
                  value={form?.nombre || ''}
                />
                {errors.nombre && (
                  <small className="text-danger">{errors.nombre}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="apellido">Tu apellido:</label>
                <input
                  type="text"
                  className="small"
                  id="apellido"
                  name="apellido"
                  placeholder="Tu apellido"
                  required
                  onChange={handleChange}
                  value={form?.apellido || ''}
                />
                {errors.apellido && (
                  <small className="text-danger">{errors.apellido}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="dni">Tu DNI:</label>
                <input
                  type="number"
                  className="small"
                  id="dni"
                  name="dni"
                  placeholder="Tu DNI"
                  required
                  onChange={handleChange}
                  value={form?.dni || ''}
                />
                {errors.dni && (
                  <small className="text-danger">{errors.dni}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="provincia">Tu ciudad:</label>
                <Select
                  name="provincia"
                  placeholder="Tu ciudad"
                  resource="provincias"
                  options={provinceData ? provinceData.provincias : []}
                  onChange={handleChange}
                  keyName="nombre"
                  value={form?.provincia || ''}
                />
                {errors.provincia && (
                  <small className="text-danger">{errors.provincia}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="direccion">Tu dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  required
                  onChange={handleChange}
                  value={form?.direccion || ''}
                />
                {errors.direccion && (
                  <small className="text-danger">{errors.direccion}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="cbu">Tu CBU:</label>
                <input
                  type="text"
                  className="small"
                  id="cbu"
                  name="cbu"
                  placeholder="Tu CBU"
                  required
                  onChange={handleChange}
                  value={form?.cbu || ''}
                />
                {errors.cbu && (
                  <small className="text-danger">{errors.cbu}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="bankAccount">
                  Tu número de cuenta bancaria:
                </label>
                <input
                  type="text"
                  className="small"
                  id="bankAccount"
                  name="bankAccount"
                  placeholder="Tu número de cuenta bancaria"
                  required
                  onChange={handleChange}
                />
                {errors.bankAccount && (
                  <small className="text-danger">{errors.bankAccount}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="bankName">Nombre de tu banco:</label>
                <input
                  type="text"
                  className="small"
                  id="bankName"
                  name="bankName"
                  placeholder="Nombre de tu banco"
                  required
                  onChange={handleChange}
                />
                {errors.bankName && (
                  <small className="text-danger">{errors.bankName}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="cuit">Tu CUIT:</label>
                <input
                  type="text"
                  className="small"
                  id="cuit"
                  name="cuit"
                  placeholder="Tu CUIT"
                  required
                  onChange={handleChange}
                />
                {errors.cuit && (
                  <small className="text-danger">{errors.cuit}</small>
                )}
              </fieldset>
            </div>
            <div className="account__info-subinner">
              <h6>Datos del inquilino:</h6>
              <fieldset>
                <label htmlFor="nombreTenant">Nombre:</label>
                <input
                  type="text"
                  className="small"
                  id="nombreTenant"
                  name="nombreTenant"
                  placeholder="Nombre"
                  required
                  onChange={handleChange}
                  value={form?.nombreTenant || ''}
                />
                {errors.nombreTenant && (
                  <small className="text-danger">{errors.nombreTenant}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="apellidoTenant">Apellido:</label>
                <input
                  type="text"
                  className="small"
                  id="apellidoTenant"
                  name="apellidoTenant"
                  placeholder="Apellido"
                  required
                  onChange={handleChange}
                  value={form?.apellidoTenant || ''}
                />
                {errors.apellidoTenant && (
                  <small className="text-danger">{errors.apellidoTenant}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="DNITenant">DNI:</label>
                <input
                  type="number"
                  className="small"
                  id="DNITenant"
                  name="DNITenant"
                  placeholder="DNI"
                  required
                  onChange={handleChange}
                  value={form?.DNITenant || ''}
                />
                {errors.DNITenant && (
                  <small className="text-danger">{errors.DNITenant}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="provinciaTenant">Ciudad:</label>
                <Select
                  name="provinciaTenant"
                  placeholder="Ciudad"
                  resource="provincias"
                  options={provinceData ? provinceData.provincias : []}
                  onChange={handleChange}
                  keyName="nombre"
                  value={form?.provinciaTenant || ''}
                />
                {errors.provinciaTenant && (
                  <small className="text-danger">
                    {errors.provinciaTenant}
                  </small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="direccionTenant">Dirección:</label>
                <input
                  type="text"
                  name="direccionTenant"
                  placeholder="Dirección"
                  required
                  onChange={handleChange}
                  value={form?.direccionTenant || ''}
                />
                {errors.direccionTenant && (
                  <small className="text-danger">
                    {errors.direccionTenant}
                  </small>
                )}
              </fieldset>
            </div>
            <div className="account__info-subinner">
              <h6>Datos generales:</h6>
              <fieldset>
                <label htmlFor="listingAddress">Dirección del inmueble:</label>
                <input
                  type="text"
                  className="small"
                  id="listingAddress"
                  name="listingAddress"
                  placeholder="Dirección del inmueble"
                  required
                  onChange={handleChange}
                  value={form?.listingAddress || ''}
                />
                {errors.listingAddress && (
                  <small className="text-danger">{errors.listingAddress}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="listingCity">Ciudad:</label>
                <Select
                  name="listingCity"
                  placeholder="Ciudad"
                  resource="provincias"
                  options={provinceData ? provinceData.provincias : []}
                  onChange={handleChange}
                  keyName="nombre"
                  value={form?.listingCity || ''}
                />
                {errors.listingCity && (
                  <small className="text-danger">{errors.listingCity}</small>
                )}
              </fieldset>
              <fieldset>
                <p>Moneda:</p>
                <div className="account__item">
                  <div className="account__item-inner">
                    <input
                      type="radio"
                      id="pesos"
                      name="listingMoneda"
                      onChange={handleChange}
                      value="Pesos"
                      checked={form?.listingMoneda === 'Pesos'}
                    />
                    <label htmlFor="pesos">Pesos</label>
                  </div>
                  <div className="account__item-inner">
                    <input
                      type="radio"
                      id="dolares"
                      name="listingMoneda"
                      onChange={handleChange}
                      value="Dolares"
                      checked={form?.listingMoneda === 'Dolares'}
                    />
                    <label htmlFor="dolares">Dólares</label>
                  </div>
                </div>
                {errors.listingMoneda && (
                  <small className="text-danger">{errors.listingMoneda}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="listingPrice">Precio:</label>
                <input
                  type="number"
                  name="listingPrice"
                  placeholder="Precio"
                  required
                  onChange={handleChange}
                  value={form?.listingPrice || ''}
                />
                {errors.listingPrice && (
                  <small className="text-danger">{errors.listingPrice}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="contractSignDate">
                  Fecha de firma del contrato:
                </label>
                <input
                  type="date"
                  className="small"
                  id="contractSignDate"
                  name="contractSignDate"
                  placeholder="Fecha de firma del contrato"
                  required
                  onChange={handleChange}
                />
                {errors.contractSignDate && (
                  <small className="text-danger">
                    {errors.contractSignDate}
                  </small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="contractStartDate">
                  Fecha de inicio del contrato:
                </label>
                <input
                  type="date"
                  className="small"
                  id="contractStartDate"
                  name="contractStartDate"
                  placeholder="Fecha de inicio del contrato"
                  required
                  onChange={handleChange}
                />
                {errors.contractStartDate && (
                  <small className="text-danger">
                    {errors.contractStartDate}
                  </small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="duracion">Duración del contrato:</label>
                <select
                  className="popover-button small"
                  type="text"
                  name="duracion"
                  id="duracion"
                  placeholder="Duración del contrato"
                  required
                  onChange={handleChange}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Duración del contrato</span>
                  </option>
                  <option>seis meses</option>
                  <option>un año</option>
                  <option>dos años</option>
                  <option>tres años</option>
                </select>
                {errors.duracion && (
                  <small className="text-danger">{errors.duracion}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="adjustmentType">Tipo de ajuste:</label>
                <select
                  className="popover-button small"
                  type="text"
                  name="adjustmentType"
                  id="adjustmentType"
                  placeholder="Tipo de ajuste"
                  required
                  onChange={handleChange}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Tipo de ajuste</span>
                  </option>
                  <option>trimestral</option>
                  <option>cuatrimestral</option>
                  <option>semestral</option>
                  <option>anual</option>
                </select>
                {errors.adjustmentType && (
                  <small className="text-danger">{errors.adjustmentType}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="adjustmentMethod">Método de ajuste:</label>
                <select
                  className="popover-button small"
                  name="adjustmentMethod"
                  id="adjustmentMethod"
                  placeholder="Método de ajuste"
                  required
                  onChange={handleChange}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Método de ajuste</span>
                  </option>
                  <option value="IPC">
                    Índice de Precios al Consumidor (IPC)
                  </option>
                  <option value="ICL">
                    Índice de Contratos de Locación (ICL)
                  </option>
                </select>
                {errors.adjustmentMethod && (
                  <small className="text-danger">
                    {errors.adjustmentMethod}
                  </small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="guaranteeType">Tipo de garantía:</label>
                <select
                  className="popover-button small"
                  type="text"
                  name="guaranteeType"
                  id="guaranteeType"
                  placeholder="Tipo de garantía"
                  required
                  onChange={handleChange}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Tipo de garantía</span>
                  </option>
                  <option>Garantía propietaria</option>
                  <option>Garantía de fianza</option>
                  <option>Seguro de caución</option>
                  <option>Aval bancario</option>
                </select>
                {errors.guaranteeType && (
                  <small className="text-danger">{errors.guaranteeType}</small>
                )}
              </fieldset>
              <fieldset>
                <label htmlFor="inventory">Inventario del inmueble:</label>
                <textarea
                  placeholder="Inventario del inmueble"
                  id="inventory"
                  name="inventory"
                  required
                  onChange={handleChange}
                ></textarea>
                {errors.inventory && (
                  <small className="text-danger">{errors.inventory}</small>
                )}
              </fieldset>
            </div>
          </>
        ) : (
          <p>
            Generaste tu contrato, subilo para compartirlo con el inquilino para
            su revisión.
          </p>
        )}
        <div className="button-container">
          {!contractUrl ? (
            <button
              onClick={handleGenerateContract}
              className="button button--large"
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <span>Generar contrato de alquiler</span>
              )}
            </button>
          ) : (
            <button className="button button--secondary">
              <a href={contractUrl} target="_blank" download>
                Descargar contrato
              </a>
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
      <GenerateContract />
    </Suspense>
  );
}
