import React, { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const addFiles = (files) => {
    const newFiles = Array.from(files);
    setUploadedFiles((prevFiles) => {
      const filteredFiles = prevFiles.filter(
        (prevFile) => !newFiles.some((newFile) => newFile.name === prevFile.name)
      );
      return [...filteredFiles, ...newFiles];
    });
  };

  const removeFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <FileContext.Provider value={{ uploadedFiles, addFiles, removeFile }}>
      {children}
    </FileContext.Provider>
  );
};
