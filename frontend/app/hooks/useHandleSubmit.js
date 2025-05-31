import { useCallback } from 'react';

export function useUnifiedSubmit({
  user,
  id,
  uploadImage,
  uploadDocuments,
  updateListing,
  updateUser,
  removeTypename,
  refetch,
  validateFormCheck,
  fileInputRef,
  globalDocsEnabled,
}) {
  const getUnifiedSubmitHandler = useCallback(
    ({
      uploadedFiles,
      setUploadedFiles,
      newFiles,
      setNewFiles,
      setShowUpload,
      setIsLoading,
      setUploadSuccess,
      type,
      globalDocsEnabled: handlerDocsEnabled,
    }) => {
      return async function unifiedSubmit(e) {
        e.preventDefault();
        if (!validateFormCheck({ uploadedFiles, newFiles })) return;
        setIsLoading(true);

        try {
          let uploadedDocs = [...uploadedFiles];
          let newUploadedUrls = [];

          const onlyRealFiles = newFiles.filter(
            (f) => f instanceof File || f instanceof Blob,
          );

          if (onlyRealFiles.length !== newFiles.length) {
            console.warn(
              'Non-File objects detected:',
              newFiles.filter((f) => !(f instanceof File || f instanceof Blob)),
            );
          }

          if (onlyRealFiles.length > 0 && type !== 'userDocumentation') {
            const { data: uploadData } = await uploadImage({
              variables: {
                files: onlyRealFiles,
                userId: user?.id,
                listingId: id,
              },
            });
            newUploadedUrls = uploadData.uploadImage.map(
              ({ id, name, url, extension }) => ({
                id,
                name,
                url,
                extension,
              }),
            );
            uploadedDocs = [...uploadedDocs, ...newUploadedUrls];
          } else if (
            onlyRealFiles.length > 0 &&
            type === 'userDocumentation' &&
            typeof uploadDocuments === 'function'
          ) {
            const { data: uploadData } = await uploadDocuments({
              variables: {
                files: onlyRealFiles,
                userId: user?.id,
              },
            });
            newUploadedUrls = uploadData.uploadDocuments.map(
              ({ id, name, url, extension }) => ({
                id,
                name,
                url,
                extension,
              }),
            );
            uploadedDocs = [...uploadedDocs, ...newUploadedUrls];
          }

          const cleanedDocs = removeTypename(uploadedDocs);

          let input;
          if (type === 'documentation') {
            input = {
              documentation: [
                {
                  id: user?.id,
                  nombre: user?.nombre,
                  apellido: user?.apellido,
                  documents: cleanedDocs,
                },
              ],
              id,
            };
          } else if (type === 'contract') {
            input = {
              contract: {
                id: user?.id,
                nombre: user?.nombre,
                apellido: user?.apellido,
                documents: cleanedDocs,
              },
              id,
            };
          } else if (type === 'userDocumentation') {
            input = {
              documentation: {
                documentsAreGlobal:
                  typeof handlerDocsEnabled !== 'undefined'
                    ? handlerDocsEnabled
                    : globalDocsEnabled,
                documents: cleanedDocs,
              },
            };
          } else {
            throw new Error('Invalid submit type');
          }

          if (type !== 'userDocumentation') {
            await updateListing({
              variables: {
                id,
                senderId: user?.id,
                input,
              },
            });
            refetch();
          } else if (
            type === 'userDocumentation' &&
            typeof updateUser === 'function'
          ) {
            await updateUser({
              variables: {
                id: user?.id,
                input,
              },
            });
          }

          setNewFiles([]);
          setUploadedFiles(uploadedDocs);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setShowUpload(false);
          setIsLoading(false);
          setUploadSuccess(true);
        } catch (error) {
          console.error('Error uploading documents:', error);
          setIsLoading(false);
        }
      };
    },
    [
      id,
      uploadImage,
      uploadDocuments,
      updateListing,
      updateUser,
      removeTypename,
      user?.id,
      user?.nombre,
      user?.apellido,
      user?.documentation?.documentsAreGlobal,
      validateFormCheck,
      refetch,
      fileInputRef,
      globalDocsEnabled,
    ],
  );

  return getUnifiedSubmitHandler;
}
