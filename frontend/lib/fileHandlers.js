'use client';

export function handleUploadFile(e, setInputFiles) {
  const files = e.target.files ? Array.from(e.target.files) : [];
  setInputFiles((prevFiles) => [...prevFiles, ...files]);
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
