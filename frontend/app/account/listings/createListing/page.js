'use client';

import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import AccountSidebar from '@/components/AccountSidebar';
import MapComponent from '@/components/Map';
import Select from '@/components/Select';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { useLocationData } from '@/app/hooks/useLocationData';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import {
  CREATE_LISTING,
  UPDATE_LISTING,
  UPLOAD_IMAGES,
} from '@/components/queries/queries';
import { useRouter } from 'next/navigation';
import { handleUploadFile, handleRemoveFile } from '@/lib/fileHandlers';
import { useToast } from '@/components/ToastContext';

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [inputFiles, setInputFiles] = useState([]);
  const [address, setAddress] = useState('Buenos Aires, Argentina');
  const [, setListingId] = useState(null);
  const initialState = {
    ambientes: 0,
    ammenities: [],
    antiguedad_max: null,
    banos: 0,
    barrio: '',
    descripcion: '',
    direccion: null,
    dormitorios: 0,
    estado: 'Activo',
    expensas: null,
    fotos: [],
    moneda: '',
    municipio: '',
    precio: null,
    provincia: '',
    superficie_cubierta: null,
    superficie_total: null,
    tipo_de_alquiler: '',
    tipo_de_ambientes: [],
    tipo_de_propiedad: '',
    titulo: '',
    toilettes: 0,
  };

  const {
    provinceData,
    cityData,
    localidadesData,
    setSelectedProvince,
    setSelectedCity,
    setSelectedLocalidad,
  } = useLocationData();

  const {
    form,
    setForm,
    errors,
    handleChange,
    validateFormCheck,
    handleIncrement,
    handleDecrement,
  } = useFormValidation(initialState, 'createListing', 'createListing', {
    setSelectedProvince,
    setSelectedCity,
    setSelectedLocalidad,
  });
  const [createListing] = useMutation(CREATE_LISTING, {
    onCompleted: (data) => {
      if (data?.createListing?.id) {
        setListingId(data.createListing.id);
      }
    },
  });
  const [updateListing] = useMutation(UPDATE_LISTING);
  const [uploadImage] = useMutation(UPLOAD_IMAGES);

  const uploadFilesToCloudinary = async (files, userId, listingId) => {
    try {
      const { data } = await uploadImage({
        variables: { files, userId, listingId },
      });

      return data.uploadImage.map(({ id, name, url }) => ({ id, name, url }));
    } catch (error) {
      console.error('Error subiendo las imágenes a Cloudinary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormCheck()) {
      document.querySelector('html').scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const buttonType = e.target.name;
    const estadoValue = buttonType === 'save' ? 'Borrador' : 'Activo';

    if (estadoValue === 'Borrador') {
      showToast('Cambios guardados con éxito!');
      setIsLoadingSave(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { listingId: _, id: __, ...formCleaned } = form;

      const { data } = await createListing({
        variables: {
          input: {
            ...formCleaned,
            estado: estadoValue,
          },
        },
      });

      const newListingId = data?.createListing?.id;
      if (!newListingId) throw new Error('No se pudo crear el listing');

      setListingId(newListingId);

      let uploadedImageUrls = [];

      if (inputFiles.length > 0) {
        uploadedImageUrls = await uploadFilesToCloudinary(
          inputFiles,
          user.id,
          newListingId,
        );

        await updateListing({
          variables: {
            id: newListingId,
            input: {
              ...formCleaned,
              fotos: uploadedImageUrls,
              estado: estadoValue,
            },
          },
        });

        setForm((prev) => ({
          ...prev,
          fotos: uploadedImageUrls,
        }));
      }

      setIsLoading(false);
      setIsLoadingSave(false);

      if (estadoValue === 'Activo') {
        router.push('/account/listings');
        showToast('Inmueble creado con éxito!');
      }
    } catch (error) {
      console.error('Listing error:', error);
      showToast(`Hubo un error al crear el inmueble: ${error}`, 'error');
      setIsLoading(false);
      setIsLoadingSave(false);
    }
  };

  const handleBlur = (e) => {
    if (provincia?.value && barrio?.value && e.target.value) {
      setAddress(`${e.target.value}, ${barrio.value}, ${provincia.value}`);
    }
  };

  useEffect(() => {
    if (form?.provincia) {
      setSelectedProvince(form.provincia);
    }
  }, [form?.provincia]);

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <h2>Nueva publicación</h2>
        <form encType="multipart/form-data">
          <fieldset>
            <label htmlFor="alquiler">Tipo de operación:</label>
            <div className="account__item">
              <div className="account__item-inner">
                <input
                  type="radio"
                  id="alquiler"
                  name="tipo_de_alquiler"
                  required
                  onChange={handleChange}
                  value="Alquiler"
                />
                <label htmlFor="alquiler">Alquiler</label>
              </div>
              <div className="account__item-inner">
                <input
                  type="radio"
                  id="alquiler-temporario"
                  name="tipo_de_alquiler"
                  required
                  onChange={handleChange}
                  value="Alquiler temporario"
                />
                <label htmlFor="alquiler-temporario">Alquiler temporario</label>
              </div>
            </div>
            {errors.tipo_de_alquiler && (
              <small className="text-danger">{errors.tipo_de_alquiler}</small>
            )}
          </fieldset>
          <fieldset>
            <label htmlFor="pesos">Moneda:</label>
            <div className="account__item">
              <div className="account__item-inner">
                <input
                  type="radio"
                  id="pesos"
                  name="moneda"
                  required
                  onChange={handleChange}
                  value="Pesos"
                />
                <label htmlFor="pesos">Pesos</label>
              </div>
              <div className="account__item-inner">
                <input
                  type="radio"
                  id="dolares"
                  name="moneda"
                  required
                  onChange={handleChange}
                  value="Dolares"
                />
                <label htmlFor="dolares">Dólares</label>
              </div>
            </div>
            {errors.moneda && (
              <small className="text-danger">{errors.moneda}</small>
            )}
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="precio">Precio:</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  placeholder="Precio"
                  required
                  onChange={handleChange}
                />
                {errors.precio && (
                  <small className="text-danger">{errors.precio}</small>
                )}
              </div>
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="expensas">Expensas:</label>
                <input
                  type="number"
                  name="expensas"
                  id="expensas"
                  placeholder="Expensas"
                  required
                  onChange={handleChange}
                />
                {errors.expensas && (
                  <small className="text-danger">{errors.expensas}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label>Tipo de propiedad:</label>
                <select
                  className="popover-button small"
                  name="tipo_de_propiedad"
                  placeholder="Tipo de propiedad"
                  required
                  onChange={handleChange}
                >
                  <button>
                    <selectedcontent></selectedcontent>
                    <span className="arrow"></span>
                  </button>
                  <option value="" hidden>
                    <span>Tipo de propiedad</span>
                  </option>
                  <option>Departamento</option>
                  <option>Casa</option>
                  <option>PH</option>
                  <option>Otros</option>
                </select>
                {errors.tipo_de_propiedad && (
                  <small className="text-danger">
                    {errors.tipo_de_propiedad}
                  </small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label>Antiguedad (años):</label>
                <input
                  type="number"
                  name="antiguedad_max"
                  placeholder="Antiguedad"
                  required
                  min="0"
                  onChange={handleChange}
                />
                {errors.antiguedad_max && (
                  <small className="text-danger">{errors.antiguedad_max}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="superficie_cubierta">
                  Superficie cubierta (mts2):
                </label>
                <input
                  type="number"
                  name="superficie_cubierta"
                  id="superficie_cubierta"
                  placeholder="Superficie cubierta"
                  required
                  min="0"
                  onChange={handleChange}
                />
                {errors.superficie_cubierta && (
                  <small className="text-danger">
                    {errors.superficie_cubierta}
                  </small>
                )}
              </div>
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="superficie_total">
                  Superficie total (mts2):
                </label>
                <input
                  type="number"
                  name="superficie_total"
                  id="superficie_total"
                  placeholder="Superficie total"
                  required
                  min="0"
                  onChange={handleChange}
                />
                {errors.superficie_total && (
                  <small className="text-danger">
                    {errors.superficie_total}
                  </small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label>Provincia:</label>
                <Select
                  name="provincia"
                  placeholder="Provincia"
                  resource="provincias"
                  options={provinceData ? provinceData.provincias : []}
                  onChange={handleChange}
                  keyName="nombre"
                />
                {errors.provincia && (
                  <small className="text-danger">{errors.provincia}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="barrio">Barrio:</label>
                <Select
                  name="barrio"
                  id="barrio"
                  placeholder="Barrio"
                  onChange={handleChange}
                  options={cityData ? cityData.localidades : []}
                  keyName="nombre"
                />
                {errors.barrio && (
                  <small className="text-danger">{errors.barrio}</small>
                )}
              </div>
            </div>
          </fieldset>
          {localidadesData?.length > 0 && (
            <fieldset>
              <div className="account__item">
                <div className="account__item-inner account__item-inner--half">
                  <label htmlFor="municipio">Municipio:</label>
                  <Select
                    name="municipio"
                    id="municipio"
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
                <label htmlFor="direccion">Dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  id="direccion"
                  placeholder="Dirección"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.direccion && (
                  <small className="text-danger">{errors.direccion}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="titulo">Título de la publicación:</label>
                <input
                  type="text"
                  name="titulo"
                  id="titulo"
                  placeholder="Título"
                  required
                  onChange={handleChange}
                />
                {errors.titulo && (
                  <small className="text-danger">{errors.titulo}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  placeholder="Descripción"
                  required
                  onChange={handleChange}
                ></textarea>
                {errors.descripcion && (
                  <small className="text-danger">{errors.descripcion}</small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="ambientes">Ambientes:</label>
                <div className="account__item-number">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDecrement('ambientes');
                    }}
                  >
                    -
                  </button>
                  <input
                    min="0"
                    type="number"
                    name="ambientes"
                    id="ambientes"
                    placeholder="0"
                    value={form.ambientes}
                    onChange={handleChange}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleIncrement('ambientes');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="dormitorios">Dormitorios:</label>
                <div className="account__item-number">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDecrement('dormitorios');
                    }}
                  >
                    -
                  </button>
                  <input
                    min="0"
                    type="number"
                    name="dormitorios"
                    id="dormitorios"
                    placeholder="0"
                    onChange={handleChange}
                    value={form.dormitorios}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleIncrement('dormitorios');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="banos">Baños:</label>
                <div className="account__item-number">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDecrement('banos');
                    }}
                  >
                    -
                  </button>
                  <input
                    min="0"
                    type="number"
                    name="banos"
                    id="banos"
                    placeholder="0"
                    onChange={handleChange}
                    value={form.banos}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleIncrement('banos');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <label htmlFor="toilettes">Toilettes:</label>
                <div className="account__item-number">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDecrement('toilettes');
                    }}
                  >
                    -
                  </button>
                  <input
                    min="0"
                    type="number"
                    name="toilettes"
                    placeholder="0"
                    onChange={handleChange}
                    value={form.toilettes}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleIncrement('toilettes');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <label>Tipos de ambientes:</label>
            <div className="account__item account__item--checkbox">
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="balcon"
                    name="tipo_de_ambientes"
                    onChange={handleChange}
                    value="balcon"
                  />
                  <label htmlFor="balcon">Balcón</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="jardin"
                    name="tipo_de_ambientes"
                    onChange={handleChange}
                    value="jardin"
                  />
                  <label htmlFor="jardin">Jardín</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="patio"
                    name="tipo_de_ambientes"
                    onChange={handleChange}
                    value="patio"
                  />
                  <label htmlFor="patio">Patio</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="terraza"
                    name="tipo_de_ambientes"
                    onChange={handleChange}
                    value="terraza"
                  />
                  <label htmlFor="terraza">Terraza</label>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <label>Ammenities:</label>
            <div className="account__item account__item--checkbox">
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="gimnasio"
                    name="ammenities"
                    onChange={handleChange}
                    value="gimnasio"
                  />
                  <label htmlFor="gimnasio">Gimnasio</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="lavadero"
                    name="ammenities"
                    onChange={handleChange}
                    value="lavadero"
                  />
                  <label htmlFor="lavadero">Lavadero</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="parrilla"
                    name="ammenities"
                    onChange={handleChange}
                    value="parrilla"
                  />
                  <label htmlFor="parrilla">Parrilla</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="pileta"
                    name="ammenities"
                    onChange={handleChange}
                    value="pileta"
                  />
                  <label htmlFor="pileta">Pileta</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="quincho"
                    name="ammenities"
                    onChange={handleChange}
                    value="quincho"
                  />
                  <label htmlFor="quincho">Quincho</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input
                    type="checkbox"
                    id="SUM"
                    name="ammenities"
                    onChange={handleChange}
                    value="SUM"
                  />
                  <label htmlFor="SUM">SUM</label>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div
              className={
                inputFiles.length > 0
                  ? 'account__item-photo-upload account__item-photo-upload-align-top'
                  : 'account__item-photo-upload'
              }
            >
              <input
                type="file"
                multiple
                onChange={(e) => handleUploadFile(e, setInputFiles)}
              />
              {inputFiles.length > 0 ? (
                inputFiles.map((file, index) => (
                  <div key={index} className="account__item-photo-item">
                    <span className="account__item-photo-extension">
                      {file.type.split('/')[1]}
                    </span>
                    <span>{file.name}</span>
                    <button
                      onClick={(e) =>
                        handleRemoveFile(
                          e,
                          index,
                          setInputFiles,
                          setForm,
                          'fotos',
                        )
                      }
                      className="account__item-photo-close"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="none"
                  >
                    <path
                      stroke="#FF9500"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21.5 15.5v4a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-4M17.5 8.5l-5-5-5 5M12.5 3.5v12"
                    />
                  </svg>
                  <p>Agregá las fotos de tu inmueble</p>
                </>
              )}
            </div>
          </fieldset>
          <div className="button-container">
            <button
              onClick={handleSubmit}
              type="submit"
              name="save"
              className="button button--secondary"
              disabled={isLoadingSave}
            >
              {isLoadingSave ? (
                <span className="loader loader--variant"></span>
              ) : (
                <span>Guardar cambios</span>
              )}
            </button>
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
                <span>Publicar</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="account-map">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
          <MapComponent address={address} />
        </APIProvider>
      </div>
    </div>
  );
}
