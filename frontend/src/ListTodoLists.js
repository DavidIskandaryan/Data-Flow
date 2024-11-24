import React, { useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListTodoLists.css';
import { FileContext } from './FileContext';

function ListToDoLists() {
  const { uploadedFiles, addFiles, removeFile } = useContext(FileContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUploadMoreFiles = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const handleAnalyze = () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file to analyze.");
      return;
    }
    navigate("/analyze");
  };

  return (
    <div className="ListToDoLists">
      <h1>Uploaded Files</h1>
      <div className="fileList">
        {uploadedFiles.length === 0 ? (
          <p>No files uploaded.</p>
        ) : (
          uploadedFiles.map((file, index) => (
            <div key={index} className="fileItem">
              <span className="fileName">{file.name}</span>
              <button className="deleteButton" onClick={() => removeFile(index)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      <div className="buttonContainer">
        <button className="uploadButton" onClick={handleUploadMoreFiles}>Upload More Files</button>
        <button className="uploadButton" onClick={handleAnalyze}>Analyze with Data Flow</button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ListToDoLists;