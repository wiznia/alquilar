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
import { useUnifiedSubmit } from '@/app/hooks/useHandleSubmit';
import { useToast } from '@/components/ToastContext';

function Documentation() {
  const { user } = useAuth();
  const showToast = useToast();
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const page = pathname.split('/').findLast((element) => element);
  const id = useSearchParams().get('id');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: { id },
  });
  const [uploadImage] = useMutation(UPLOAD_IMAGES);
  const [updateListing, { loading: updateLoading }] =
    useMutation(UPDATE_LISTING);
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
    setIsLoading,
    type: 'documentation',
  });

  const displayFiles = [
    ...uploadedFiles.map((f) => ({ ...f, __uploaded: true, __global: false })),
    ...newFiles.map((f) => ({
      name: f.name,
      type: f.type,
      __uploaded: false,
      __global: false,
    })),
  ];

  const documentationArr = data?.getListingById?.documentation || [];
  const ownerUser = data?.getListingById?.owner;

  function mergeDocs(primary, global) {
    const ids = new Set(primary.map((d) => d.id || d.name));
    return [...primary, ...global.filter((d) => !ids.has(d.id || d.name))];
  }

  const userDocObj = documentationArr.find((doc) => doc.id === user?.id);
  const userRegularDocs = userDocObj?.documents || [];
  const userGlobalDocs =
    user?.documentation?.documentsAreGlobal && user?.documentation?.documents
      ? user.documentation.documents
      : [];
  const allUserDocs = mergeDocs(userRegularDocs, userGlobalDocs);

  const ownerDocObj = documentationArr.find((doc) => doc.id === ownerUser?.id);
  const ownerRegularDocs = ownerDocObj?.documents || [];
  const ownerGlobalDocs =
    ownerUser?.documentation?.documentsAreGlobal &&
    ownerUser?.documentation?.documents
      ? ownerUser.documentation.documents
      : [];
  const allOwnerDocs = mergeDocs(ownerRegularDocs, ownerGlobalDocs);

  const handleSubmitContract = async () => {
    const potentialTenantAgreed =
      !data?.getListingById?.contract?.potentialTenantAgreed;
    await updateListing({
      variables: {
        id,
        input: {
          contract: {
            potentialTenantAgreed,
          },
        },
        senderId: user?.id,
      },
    });
    showToast(
      `${potentialTenantAgreed === true ? 'Confirmaste' : 'Desconfirmaste'} tus datos en el contrato.`,
    );
    await refetch();
  };

  useEffect(() => {
    if (!formLoaded && data?.getListingById && user?.id) {
      const userDocuments = documentationArr.find((doc) => doc.id === user?.id);
      setUploadedFiles(userDocuments ? userDocuments.documents : []);
      setForm(data.getListingById);
      setFormLoaded(true);
    }
  }, [data?.getListingById, user?.id, documentationArr, setForm, formLoaded]);

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
        <InlineNav id={id} page={page} user={user} listingData={data} />
        <div className="account__info-inner">
          <h6>Documentos:</h6>
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
              ref={fileInputRef}
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
                        fileInputRef,
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
          {errors.documentation && (
            <small className="text-danger">{errors.documentation}</small>
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
                  {uploadedFiles.length > 0 ? 'Actualizar' : 'Subir archivos'}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="account__info-inner" key={user?.id}>
          <h6>Tu documentación:</h6>
          {allUserDocs.map((doc) => (
            <div key={doc.id || doc.name} className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {doc.extension || (doc.type ? doc.type.split('/')[1] : '')}
              </span>
              <span>{doc.name}</span>
              <Link href={doc.url} target="_blank">
                Ver
              </Link>
            </div>
          ))}
        </div>

        {ownerUser && (
          <div className="account__info-inner" key={ownerUser.id}>
            <h6>
              Documentación de{' '}
              <Link href={`/user/${ownerUser.id}`} className="dark">
                {ownerUser.nombre} {ownerUser.apellido}
              </Link>
              :
            </h6>
            {allOwnerDocs.map((doc) => (
              <div
                key={doc.id || doc.name}
                className="account__item-photo-item"
              >
                <span className="account__item-photo-extension">
                  {doc.extension || (doc.type ? doc.type.split('/')[1] : '')}
                </span>
                <span>{doc.name}</span>
                <Link href={doc.url} target="_blank">
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}

        {data?.getListingById?.contract?.documents?.length > 0 && (
          <div className="account__info-inner">
            <h6>Tu contrato de alquiler:</h6>
            {data?.getListingById?.potentialTenantAgreed !== true && (
              <p>
                Confirmá que todos tus datos estén bien y que no haya ningún
                error. Si hay algun problema, comunicate con el{' '}
                <Link
                  className="dark"
                  href={`/user/${data?.getListingById?.owner?.id}`}
                >
                  dueño
                </Link>
                .
              </p>
            )}
            <div className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {data?.getListingById?.contract?.documents[0]?.extension}
              </span>
              <span>{data?.getListingById?.contract?.documents[0]?.name}</span>
              <Link
                href={data?.getListingById?.contract?.documents[0]?.url}
                target="_blank"
              >
                Ver
              </Link>
            </div>
            <div className="button-container">
              <button
                onClick={handleSubmitContract}
                className="button"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <span className="loader"></span>
                ) : data?.getListingById?.contract?.potentialTenantAgreed ===
                  true ? (
                  'Desconfirmar datos'
                ) : (
                  'Confirmar datos'
                )}
              </button>
            </div>
          </div>
        )}
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
