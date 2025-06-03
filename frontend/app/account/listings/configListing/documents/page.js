'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Breadcrumb from '@/components/Breadcrumb';
import {
  SINGLE_LISTING_QUERY,
  GET_USER_BY_ID,
  UPDATE_LISTING,
  UPLOAD_IMAGES,
} from '@/components/queries/queries';
import { useSearchParams, usePathname } from 'next/navigation';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import Loading from '@/components/Loading';
import { Suspense, useEffect, useRef, useState } from 'react';
import InlineNav from '@/components/InlineNav';
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
  const [globalFiles, setGlobalFiles] = useState([]);

  const { data, loading, error, refetch } = useQuery(SINGLE_LISTING_QUERY, {
    variables: { id },
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
    ...uploadedFiles.map((f) => ({ ...f, __uploaded: true, __global: false })),
    ...newFiles.map((f) => ({
      name: f.name,
      type: f.type,
      __uploaded: false,
      __global: false,
    })),
  ];

  const displayContract = [
    ...uploadedContract.map((f) => ({ ...f, __uploaded: true })),
    ...newContract.map((f) => ({
      name: f.name,
      type: f.type,
      __uploaded: false,
    })),
  ];

  const [fetchTenant] = useLazyQuery(GET_USER_BY_ID);
  const [tenantsDocs, setTenantsDocs] = useState([]);
  const [tenantLoading, setTenantLoading] = useState(false);
  const potentialTenantIds = data?.getListingById?.potential_tenant || [];
  const listingDocumentationArr = data?.getListingById?.documentation || [];

  useEffect(() => {
    let isMounted = true;
    async function fetchAllTenants() {
      setTenantLoading(true);
      const tenants = [];

      for (const tenantId of potentialTenantIds) {
        try {
          const listingDocsObj = listingDocumentationArr.find(
            (doc) => doc.id === tenantId,
          );
          const listingDocs = Array.isArray(listingDocsObj?.documents)
            ? listingDocsObj.documents
            : [];

          const { data: tenantRes } = await fetchTenant({
            variables: { id: tenantId },
            fetchPolicy: 'network-only',
          });
          const tenant = tenantRes?.getUser;
          if (tenant) {
            const documentation = tenant.documentation || {};
            let globalDocs = [];
            if (
              documentation.documentsAreGlobal &&
              Array.isArray(documentation.documents)
            ) {
              globalDocs = documentation.documents;
            }

            const ids = new Set(listingDocs.map((d) => d.id || d.name));
            const mergedDocs = [
              ...listingDocs,
              ...globalDocs.filter((d) => !ids.has(d.id || d.name)),
            ];

            if (mergedDocs.length > 0) {
              tenants.push({
                id: tenant.id,
                nombre: tenant.nombre,
                apellido: tenant.apellido,
                docs: mergedDocs,
              });
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) setTenantsDocs(tenants);
      setTenantLoading(false);
    }
    if (potentialTenantIds.length > 0) {
      fetchAllTenants();
    } else {
      setTenantsDocs([]);
    }
    return () => {
      isMounted = false;
    };
  }, [
    JSON.stringify(potentialTenantIds),
    JSON.stringify(listingDocumentationArr),
  ]);

  const documentationArr = data?.getListingById?.documentation || [];
  const ownerDocObj = documentationArr.find((doc) => doc.id === user?.id);
  const ownerRegularDocs = ownerDocObj?.documents || [];
  const ownerGlobalDocs =
    user?.documentation?.documentsAreGlobal && user?.documentation?.documents
      ? user.documentation.documents
      : [];
  const ownerDocIds = new Set(ownerRegularDocs.map((d) => d.id || d.name));
  const allOwnerDocs = [
    ...ownerRegularDocs,
    ...ownerGlobalDocs.filter((d) => !ownerDocIds.has(d.id || d.name)),
  ];

  useEffect(() => {
    if (user && user?.documentation?.documentsAreGlobal) {
      setGlobalFiles(user?.documentation?.documents || []);
    } else {
      setGlobalFiles([]);
    }

    if (data?.getListingById) {
      const { documentation, contract } = data?.getListingById;
      const userDocuments = documentation.filter(
        (doc) => doc.id === user?.id,
      )[0];

      if (userDocuments?.documents?.length > 0) {
        setShowUploadFiles(false);
      }
      setUploadedFiles(userDocuments ? userDocuments.documents : []);
      setForm(data.getListingById);

      if (contract.id === user?.id) {
        setUploadedContract(
          Array.isArray(contract?.documents) ? contract.documents : [],
        );
        setShowUploadedContract(false);
      }
    }
  }, [
    data?.getListingById,
    user?.id,
    setForm,
    user?.documentation?.documentsAreGlobal,
  ]);

  if (loading || tenantLoading) {
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
          direccion={form?.direccion}
          title={user?.tipo_de_cuenta === 'Dueño' ? 'inmuebles' : 'alquileres'}
          user={user}
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
              <small className="error-message">{errors.documentation}</small>
            )}
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

        <div className="account__info-inner" key={user?.id}>
          <h6>Tu documentación:</h6>
          {allOwnerDocs.length === 0 ? (
            <p>No has subido documentación.</p>
          ) : (
            allOwnerDocs.map((doc) => (
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
            ))
          )}
        </div>

        {tenantsDocs.map((tenant) => (
          <div className="account__info-inner" key={tenant.id}>
            <h6>
              Documentación de{' '}
              <Link href={`/user/${tenant.id}`} className="dark">
                {tenant.nombre} {tenant.apellido}
              </Link>
              :
            </h6>
            {tenant.docs.map((doc) => (
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
        ))}

        {showUploadedContract ? (
          <div className="account__info-inner">
            <h6>Contrato:</h6>
            <p>
              Subí el modelo de contrato de alquiler con los datos del inquilino
              para su revisión o{' '}
              <Link
                className="dark"
                href={{
                  pathname: '/account/listings/configListing/generateContract',
                  query: {
                    id,
                  },
                }}
              >
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
                ref={fileInputRef}
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
        {form?.contract?.documents?.length > 0 && (
          <div className="account__info-inner">
            <h6>Tu contrato de alquiler:</h6>
            <div className="account__item-photo-item">
              <span className="account__item-photo-extension">
                {form?.contract?.documents[0]?.extension}
              </span>
              <span>{form?.contract?.documents[0]?.name}</span>
              <Link href={form?.contract?.documents[0]?.url}>Ver</Link>
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
