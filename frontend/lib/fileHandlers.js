'use client';

export function handleUploadFile(e, setNewFiles) {
  const files = e.target.files ? Array.from(e.target.files) : [];
  setNewFiles((prevFiles) => [...prevFiles, ...files]);
}

export function handleRemoveFile(
  e,
  indexToRemove,
  setInputFiles,
  setForm,
  type,
) {
  e.preventDefault();
  setInputFiles((prevFiles) =>
    prevFiles.filter((_, index) => index !== indexToRemove),
  );
  if (setForm) {
    setForm((prevForm) => ({
      ...prevForm,
      [type]: Array.isArray(prevForm[type])
        ? prevForm[type].filter((_, index) => index !== indexToRemove)
        : prevForm[type],
    }));
  }
}

export function handleRemoveDisplayFile(
  index,
  uploadedFiles,
  setUploadedFiles,
  setNewFiles,
  fileInputRef,
) {
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  if (index < uploadedFiles.length) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  } else {
    const newIndex = index - uploadedFiles.length;
    setNewFiles((prev) => prev.filter((_, i) => i !== newIndex));
  }
}
