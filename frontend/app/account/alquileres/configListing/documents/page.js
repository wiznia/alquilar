'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useSearchParams, usePathname } from 'next/navigation';
import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import InlineNav from '@/components/InlineNav';
import Loading from '@/components/Loading';
import removeTypename from '@/lib/removeTypename';
import { useAuth } from '@/components/AuthContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import {
  SINGLE_LISTING_QUERY,
  UPDATE_LISTING,
  UPLOAD_IMAGES,
} from '@/components/queries/queries';
import { handleUploadFile, handleRemoveDisplayFile } from '@/lib/fileHandlers';
import Link from 'next/link';

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

  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: { id },
  });
  const [uploadImage] = useMutation(UPLOAD_IMAGES);
  const [updateListing] = useMutation(UPDATE_LISTING);
  const { form, setForm, errors, validateFormCheck } = useFormValidation(
    data?.getListingById,
    'uploadDocuments',
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateFormCheck()) return;
    setIsLoading(true);

    try {
      let uploadedDocuments = [...uploadedFiles];
      let newUploadedUrls = [];

      const onlyRealFiles = newFiles.filter(
        (f) => f instanceof File || f instanceof Blob,
      );

      if (onlyRealFiles.length !== newFiles.length) {
        console.warn(
          'Non-File objects detected in newFiles:',
          newFiles.filter((f) => !(f instanceof File || f instanceof Blob)),
        );
      }

      if (onlyRealFiles.length > 0) {
        const { data: uploadData } = await uploadImage({
          variables: { files: onlyRealFiles, userId: user?.id, listingId: id },
        });
        newUploadedUrls = uploadData.uploadImage.map(
          ({ id, name, url, extension }) => ({
            id,
            name,
            url,
            extension,
          }),
        );
        uploadedDocuments = [...uploadedDocuments, ...newUploadedUrls];
      }

      const cleanedUploadedDocuments = removeTypename(uploadedDocuments);

      await updateListing({
        variables: {
          id,
          senderId: user?.id,
          input: {
            documentation: [
              {
                id: user?.id,
                nombre: user?.nombre,
                apellido: user?.apellido,
                documents: cleanedUploadedDocuments,
              },
            ],
            id,
          },
        },
      });

      setNewFiles([]);
      setUploadedFiles(uploadedDocuments);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadFiles(false);
      setIsLoading(false);
      setUploadSuccess(true);
      refetch();
    } catch (error) {
      console.error('Error subiendo los documentos:', error);
      setIsLoading(false);
    }
  }

  const displayFiles = [
    ...uploadedFiles.map((f) => ({ ...f, __uploaded: true })),
    ...newFiles.map((f) => ({ name: f.name, type: f.type, __uploaded: false })),
  ];

  const renderDocumentation = (documentation = [], user) => {
    const docs = documentation.filter(
      (document) => document.id === user?.id || document.id === form.owner.id,
    );
    const sortedDocumentation = docs.slice().sort((a, b) => {
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
          {document.documents.map((document) => (
            <div key={document.id} className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {document.extension}
              </span>
              <span>{document.name}</span>
              <Link target="_blank" href={document.url}>
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
      const userDocuments = data?.getListingById?.documentation?.filter(
        (doc) => doc.id === user?.id,
      )[0];

      if (userDocuments?.documents?.length > 0) {
        setShowUploadFiles(false);
      }
      setUploadedFiles(userDocuments ? userDocuments.documents : []);
      setForm(data.getListingById);
    }
  }, [data?.getListingById, user?.id]);

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
          user={user}
        />
        <h2>Configuración del inmueble</h2>
        <InlineNav id={id} page={page} user={user} />
        {showUploadFiles ? (
          <>
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
                displayFiles.length > 0
                  ? 'account__item-photo-upload account__item-photo-upload-align-top'
                  : 'account__item-photo-upload'
              }
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
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
                ¡Documentos subidos exitosamente!
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
          </>
        ) : (
          <div className="button-container">
            <button className="button" onClick={() => setShowUploadFiles(true)}>
              Editar documentación
            </button>
          </div>
        )}
        {data?.getListingById?.contract?.documents?.length > 0 && (
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
