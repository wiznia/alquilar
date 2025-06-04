'use client';

import AccountSidebar from '@/components/AccountSidebar';
import { UPDATE_USER, UPLOAD_DOCUMENTS } from '@/components/queries/queries';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import { useFormValidation } from '@/app/hooks/useFormValidation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { handleUploadFile, handleRemoveDisplayFile } from '@/lib/fileHandlers';
import removeTypename from '@/lib/removeTypename';
import { useUnifiedSubmit } from '@/app/hooks/useHandleSubmit';

function Documents() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const id = useSearchParams().get('id');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [showUploadFiles, setShowUploadFiles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [globalDocsEnabled, setGlobalDocsEnabled] = useState(
    user?.documentation?.documentsAreGlobal || false,
  );
  const [uploadDocuments] = useMutation(UPLOAD_DOCUMENTS);
  const [updateUser] = useMutation(UPDATE_USER);

  const { form, errors, validateFormCheck } = useFormValidation(
    user,
    'uploadDocuments',
  );

  const getUnifiedSubmitHandler = useUnifiedSubmit({
    user,
    id,
    uploadDocuments,
    updateUser,
    removeTypename,
    validateFormCheck,
    fileInputRef,
    globalDocsEnabled,
  });

  const handleSubmit = getUnifiedSubmitHandler({
    uploadedFiles,
    setUploadedFiles,
    newFiles,
    setNewFiles,
    setShowUpload: setShowUploadFiles,
    setIsLoading,
    setUploadSuccess,
    type: 'userDocumentation',
    globalDocsEnabled,
  });

  const displayFiles = [
    ...uploadedFiles.map((f) => ({ ...f, __uploaded: true })),
    ...newFiles.map((f) => ({ name: f.name, type: f.type, __uploaded: false })),
  ];

  useEffect(() => {
    setUploadedFiles(user?.documentation ? user?.documentation?.documents : []);
    setGlobalDocsEnabled(user?.documentation?.documentsAreGlobal || false);
  }, [user]);

  return (
    <div className="account">
      <AccountSidebar />
      <div className="account__info">
        <div className="account__info-inner">
          <h6>Documentos:</h6>
          <p>
            Acá podés ver toda tu documentación. También podés asociar estos
            archivos a cualquier inmueble que alquiles habilitando documentos
            globales. De esa forma no tendrás que volver a subir cada uno a cada
            inmueble.
          </p>
          <div className="popover__item">
            <input
              type="checkbox"
              className="switch"
              id="documents-global"
              checked={globalDocsEnabled}
              onChange={(e) => setGlobalDocsEnabled(e.target.checked)}
            />
            <label htmlFor="documents-global">
              Habilitar documentos globales
            </label>
          </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Documents />
    </Suspense>
  );
}
