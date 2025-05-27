'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import {
  SINGLE_LISTING_QUERY,
  UPDATE_LISTING,
  UPLOAD_IMAGES,
} from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useRef, useState } from 'react';
import InlineNav from '@/components/InlineNav';
import { usePathname } from 'next/navigation';
import { handleUploadFile, handleRemoveDisplayFile } from '@/lib/fileHandlers';
import removeTypename from '@/lib/removeTypename';
import Link from 'next/link';
import { useUnifiedSubmit } from '@/app/hooks/useHandleSubmit';

function Documentation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const page = pathname.split('/').findLast((element) => element);
  const id = useSearchParams().get('id');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [showUploadFiles, setShowUploadFiles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedContract, setUploadedContract] = useState([]);
  const [newContract, setNewContract] = useState([]);
  const [showUploadedContract, setShowUploadedContract] = useState(true);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [uploadContractSuccess, setUploadContractSuccess] = useState(false);

  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const [uploadImage] = useMutation(UPLOAD_IMAGES);
  const [updateListing] = useMutation(UPDATE_LISTING);
  const { form, setForm, errors, validateFormCheck } = useFormValidation(
    data?.getListingById,
    'uploadDocuments',
  );

  const getUnifiedSubmitHandler = useUnifiedSubmit({
    user,
    id,
    uploadImage,
    updateListing,
    removeTypename,
    refetch,
    validateFormCheck,
    fileInputRef,
  });

  const handleSubmit = getUnifiedSubmitHandler({
    uploadedFiles,
    setUploadedFiles,
    newFiles,
    setNewFiles,
    setShowUpload: setShowUploadFiles,
    setIsLoading,
    setUploadSuccess,
    type: 'documentation',
  });

  const handleSubmitContract = getUnifiedSubmitHandler({
    uploadedFiles: uploadedContract,
    setUploadedFiles: setUploadedContract,
    newFiles: newContract,
    setNewFiles: setNewContract,
    setShowUpload: setShowUploadedContract,
    setIsLoading: setIsLoadingContract,
    setUploadSuccess: setUploadContractSuccess,
    type: 'contract',
  });

  const displayFiles = [
    ...uploadedFiles.map((f) => ({ ...f, __uploaded: true })),
    ...newFiles.map((f) => ({ name: f.name, type: f.type, __uploaded: false })),
  ];

  const displayContract = [
    ...uploadedContract.map((f) => ({ ...f, __uploaded: true })),
    ...newContract.map((f) => ({
      name: f.name,
      type: f.type,
      __uploaded: false,
    })),
  ];

  const renderDocumentation = (documentation = [], user) => {
    const sortedDocumentation = documentation.slice().sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return 0;
    });

    return sortedDocumentation.map((document) => {
      const title =
        user?.id === document.id ? 'Tu documentación' : 'Documentación de';

      return (
        <div className="account__info-inner" key={document.id}>
          {user?.id === document.id ? (
            <h6>{title}:</h6>
          ) : (
            <h6>
              {title}{' '}
              <Link
                href={`/user/${document.id}`}
                className="dark"
              >{`${document.nombre} ${document.apellido}`}</Link>
              :
            </h6>
          )}
          {document.documents?.map((document) => (
            <div key={document.id} className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {document.extension}
              </span>
              <span>{document.name}</span>
              <Link href={document.url} target="_blank">
                Ver
              </Link>
            </div>
          ))}
        </div>
      );
    });
  };

  useEffect(() => {
    if (data?.getListingById) {
      const userDocuments = data?.getListingById?.documentation.filter(
        (doc) => doc.id === user?.id,
      )[0];

      if (userDocuments?.documents?.length > 0) {
        setShowUploadFiles(false);
      }
      setUploadedFiles(userDocuments ? userDocuments.documents : []);
      setForm(data.getListingById);

      if (data.getListingById?.contract?.id === user?.id) {
        setUploadedContract(
          Array.isArray(data.getListingById?.contract?.documents)
            ? data.getListingById.contract.documents
            : [],
        );
        setShowUploadedContract(false);
      }
    }
  }, [data?.getListingById, user?.id, setForm]);

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
        <InlineNav id={id} page={page} user={user} />
        {showUploadFiles ? (
          <div className="account__info-inner">
            <h6>Documentos:</h6>
            <p>Recordá que tenés que subir tu DNI (frente y dorso).</p>
            <div
              className={
                displayFiles.length > 0
                  ? 'account__item-photo-upload account__item-photo-upload-align-top'
                  : 'account__item-photo-upload'
              }
            >
              <input
                type="file"
                multiple
                onChange={(e) => handleUploadFile(e, setNewFiles)}
              />
              {displayFiles.length > 0 ? (
                displayFiles.map((file, index) => (
                  <div key={index} className="account__item-photo-item">
                    <span className="account__item-photo-extension">
                      {file?.type ? file.type.split('/')[1] : file.extension}
                    </span>
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveDisplayFile(
                          index,
                          uploadedFiles,
                          setUploadedFiles,
                          setNewFiles,
                        );
                      }}
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
            {uploadSuccess && (
              <p className="success-message">
                Documentos subidos exitósamente!
              </p>
            )}
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
                  <span>
                    {displayFiles.length > 0 ? 'Actualizar' : 'Subir archivos'}
                  </span>
                )}
              </button>
              <button
                className="button button--secondary"
                onClick={() => setShowUploadFiles(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="button-container">
            <button className="button" onClick={() => setShowUploadFiles(true)}>
              Editar documentación
            </button>
          </div>
        )}
        {showUploadedContract ? (
          <div className="account__info-inner">
            <h6>Contrato:</h6>
            <p>
              Subí el modelo de contrato de alquiler con los datos del inquilino
              para su revisión o{' '}
              <Link className="dark" href="#">
                generalo automáticamente (experimental)
              </Link>
              .
            </p>
            <div
              className={
                displayContract.length > 0
                  ? 'account__item-photo-upload account__item-photo-upload-align-top'
                  : 'account__item-photo-upload'
              }
            >
              <input
                type="file"
                multiple
                onChange={(e) => handleUploadFile(e, setNewContract)}
              />
              {displayContract.length > 0 ? (
                displayContract.map((file, index) => (
                  <div key={index} className="account__item-photo-item">
                    <span className="account__item-photo-extension">
                      {file?.type ? file.type.split('/')[1] : file.extension}
                    </span>
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveDisplayFile(
                          index,
                          uploadedContract,
                          setUploadedContract,
                          setNewContract,
                        );
                      }}
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
            {uploadContractSuccess && (
              <p className="success-message">
                Documentos subidos exitósamente!
              </p>
            )}
            <div className="button-container">
              <button
                onClick={handleSubmitContract}
                type="submit"
                name="publish"
                className="button"
                disabled={isLoadingContract}
              >
                {isLoadingContract ? (
                  <span className="loader"></span>
                ) : (
                  <span>
                    {displayContract.length > 0
                      ? 'Actualizar'
                      : 'Subir archivos'}
                  </span>
                )}
              </button>
              <button
                className="button button--secondary"
                onClick={() => setShowUploadedContract(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="button-container">
            <button
              className="button"
              onClick={() => setShowUploadedContract(true)}
            >
              Editar contrato
            </button>
          </div>
        )}
        {data?.getListingById?.contract && (
          <div className="account__info-inner">
            <h6>Tu contrato de alquiler:</h6>
            <div className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {data?.getListingById?.contract?.documents[0]?.extension}
              </span>
              <span>{data?.getListingById?.contract?.documents[0]?.name}</span>
              <Link href={data?.getListingById?.contract?.documents[0]?.url}>
                Ver
              </Link>
            </div>
          </div>
        )}
        {renderDocumentation(form?.documentation, user)}
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
