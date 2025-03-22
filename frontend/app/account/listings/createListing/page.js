'use client';

import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import AccountSidebar from '@/components/AccountSidebar';
import MapComponent from '@/components/Map';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Select from '@/components/Select';
import {} from '@/components/queries/queries';
import { useMutation } from '@apollo/client';

export default function Page() {
  const [inputFiles, setInputFiles] = useState([]);
  const initialState = {
    ambientes: null,
    ammenities: [],
    antiguedad_max: null,
    banos: null,
    barrio: '',
    ciudad: '',
    descripcion: '',
    direccion: null,
    dormitorios: null,
    estado: 'Activo',
    expensas: null,
    fotos: [],
    moneda: '',
    precio: null,
    provincia: '',
    superficie_cubierta: null,
    superficie_total: null,
    tipo_de_alquiler: '',
    tipo_de_ambientes: [],
    tipo_de_propiedad: '',
    titulo: '',
    toilettes: null,
  };
  const {
    form,
    errors,
    handleChange,
    validateFormCheck,
    setErrors,
    provinceData,
    cityData,
    localidadesData,
  } = useFormValidation(initialState, 'createListing');

  const handleUploadFile = (e) => {
    const files = [...e.target.files];
    const filesData = files.map((file) => ({
      name: file.name,
      extension: file.type.split('/')[1],
    }));

    setInputFiles((prevFiles) => [...prevFiles, ...filesData]);
  };

  const handleRemoveFile = (e, indexToRemove) => {
    e.preventDefault();
    setInputFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = () => {
    if (!validateFormCheck()) return;

    try {
    } catch (error) {}
  };

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <h2>Nueva publicación</h2>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <p>Tipo de operación:</p>
            <div className="account__item">
              <div className="account__item-inner popover__item">
                <input
                  type="radio"
                  id="alquiler"
                  name="tipo_de_alquiler"
                  required
                />
                <label htmlFor="alquiler">Alquiler</label>
              </div>
              <div className="account__item-inner popover__item">
                <input
                  type="radio"
                  id="alquiler-temporario"
                  name="tipo_de_alquiler"
                  required
                />
                <label htmlFor="alquiler-temporario">Alquiler temporario</label>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <p>Moneda:</p>
            <div className="account__item">
              <div className="account__item-inner popover__item">
                <input type="radio" id="pesos" name="moneda" required />
                <label htmlFor="pesos">Pesos</label>
              </div>
              <div className="account__item-inner popover__item">
                <input type="radio" id="dolares" name="moneda" required />
                <label htmlFor="dolares">Dólares</label>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Precio:</p>
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  required
                />
              </div>
              <div className="account__item-inner account__item-inner--half">
                <p>Expensas:</p>
                <input
                  type="number"
                  name="expensas"
                  placeholder="Expensas"
                  required
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Tipo de propiedad:</p>
                <select
                  className="popover-button small"
                  name="tipo_de_propiedad"
                  id="tipo_de_propiedad"
                  placeholder="Tipo de propiedad"
                  required
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
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Antiguedad:</p>
                <input
                  type="number"
                  name="antiguedad"
                  placeholder="Antiguedad"
                  required
                  min="0"
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Superficie cubierta (mts2):</p>
                <input
                  type="number"
                  name="superficie_cubierta"
                  placeholder="Superficie cubierta"
                  required
                  min="0"
                />
              </div>
              <div className="account__item-inner account__item-inner--half">
                <p>Superficie total (mts2):</p>
                <input
                  type="number"
                  name="superficie_total"
                  placeholder="Superficie total"
                  required
                  min="0"
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Dirección:</p>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  required
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Provincia:</p>
                <Select
                  name="provincia"
                  placeholder="Provincia"
                  resource="provincias"
                  onChange={handleChange}
                  options={provinceData ? provinceData.provincias : []}
                />
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
                />
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
                  />
                </div>
              </div>
            </fieldset>
          )}
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Título de la publicación:</p>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  required
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Descripción</p>
                <textarea
                  name="descripcion"
                  placeholder="Descripción"
                  required
                ></textarea>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Ambientes:</p>
                <div className="account__item-number">
                  <button>-</button>
                  <input
                    min="0"
                    type="number"
                    name="ambientes"
                    placeholder="0"
                  />
                  <button>+</button>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <p>Dormitorios:</p>
                <div className="account__item-number">
                  <button>-</button>
                  <input
                    min="0"
                    type="number"
                    name="dormitorios"
                    placeholder="0"
                  />
                  <button>+</button>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="account__item">
              <div className="account__item-inner account__item-inner--half">
                <p>Baños:</p>
                <div className="account__item-number">
                  <button>-</button>
                  <input min="0" type="number" name="banos" placeholder="0" />
                  <button>+</button>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <p>Toilettes:</p>
                <div className="account__item-number">
                  <button>-</button>
                  <input
                    min="0"
                    type="number"
                    name="toilettes"
                    placeholder="0"
                  />
                  <button>+</button>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <p>Tipos de ambientes:</p>
            <div className="account__item account__item--checkbox">
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="balcon" name="balcon" />
                  <label htmlFor="balcon">Balcón</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="jardin" name="jardin" />
                  <label htmlFor="jardin">Jardín</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="patio" name="patio" />
                  <label htmlFor="patio">Patio</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="terraza" name="terraza" />
                  <label htmlFor="terraza">Terraza</label>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <p>Ammenities:</p>
            <div className="account__item account__item--checkbox">
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="gimnasio" name="gimnasio" />
                  <label htmlFor="gimnasio">Gimnasio</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="lavadero" name="lavadero" />
                  <label htmlFor="lavadero">Lavadero</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="parrilla" name="parrilla" />
                  <label htmlFor="parrilla">Parrilla</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="pileta" name="pileta" />
                  <label htmlFor="pileta">Pileta</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="quincho" name="quincho" />
                  <label htmlFor="quincho">Quincho</label>
                </div>
              </div>
              <div className="account__item-inner account__item-inner--half">
                <div className="popover__item">
                  <input type="checkbox" id="SUM" name="SUM" />
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
              <input type="file" multiple onChange={handleUploadFile} />
              {inputFiles.length > 0 ? (
                inputFiles.map((file, index) => (
                  <div key={index} className="account__item-photo-item">
                    <span className="account__item-photo-extension">
                      {file.extension}
                    </span>
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => handleRemoveFile(e, index)}
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
            <button type="button" className="button">
              Guardar cambios
            </button>
            <button type="button" className="button">
              Publicar
            </button>
          </div>
        </form>
      </div>
      <div className="account-map">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
          <MapComponent address={`Buenos Aires, Argentina`} />
        </APIProvider>
      </div>
    </div>
  );
}
