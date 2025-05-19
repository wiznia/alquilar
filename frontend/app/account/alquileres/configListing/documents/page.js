'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { SINGLE_LISTING_QUERY } from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Loading from '@/components/Loading';
import { Suspense, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import { handleUploadFile, handleRemoveFile } from '@/lib/fileHandlers';

function Documentation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const page = pathname.split('/').findLast((element) => element);
  const id = useSearchParams().get('id');
  const [inputFiles, setInputFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const { form, setForm, errors, validateFormCheck } = useFormValidation(
    data?.getListingById,
    'uploadDocuments',
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormCheck()) {
      return;
    }

    const buttonType = e.target.name;

    if (buttonType === 'save') {
      setIsLoadingSave(true);
    } else {
      setIsLoading(true);
    }
  };

  if (loading) {
    return (
      <Loading>
        <h4>Cargando inmueble...</h4>
      </Loading>
    );
  }

  if (error) {
    return (
      <Loading>
        <p>
          Hubo un problema al cargar el inmueble:
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
        <InlineNav id={id} page={page} />
        <p>
          Subí tu documentación para que el dueño la pueda evaluar. <br />
          Recordá que para alquilar necesitas:
        </p>
        <ul className="documentation-list">
          <li>DNI o pasaporte vigente</li>
          <li>Recibo de sueldo o certificado de ingresos</li>
          <li>Garantía inmobiliaria</li>
        </ul>
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
                      'documentation',
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
              <p>Subí tu documentación</p>
            </>
          )}
        </div>
        <div className="button-container">
          <button
            onClick={handleSubmit}
            type="submit"
            name="save"
            className="button button--secondary"
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <span className="loader"></span>
            ) : (
              <span>Guardar</span>
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
              <span>Actualizar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Documentation />
    </Suspense>
  );
}
