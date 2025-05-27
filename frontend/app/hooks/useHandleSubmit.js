import { useCallback } from 'react';

export function useUnifiedSubmit({
  user,
  id,
  uploadImage,
  updateListing,
  removeTypename,
  refetch,
  validateFormCheck,
  fileInputRef,
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
    }) => {
      return async function unifiedSubmit(e) {
        e.preventDefault();
        if (!validateFormCheck()) return;
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

          if (onlyRealFiles.length > 0) {
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
          } else {
            throw new Error('Invalid submit type');
          }

          await updateListing({
            variables: {
              id,
              senderId: user?.id,
              input,
            },
          });

          setNewFiles([]);
          setUploadedFiles(uploadedDocs);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setShowUpload(false);
          setIsLoading(false);
          setUploadSuccess(true);
          refetch();
        } catch (error) {
          console.error('Error uploading documents:', error);
          setIsLoading(false);
        }
      };
    },
    [
      id,
      uploadImage,
      updateListing,
      removeTypename,
      user?.id,
      user?.nombre,
      user?.apellido,
      validateFormCheck,
      refetch,
      fileInputRef,
    ],
  );

  return getUnifiedSubmitHandler;
}
