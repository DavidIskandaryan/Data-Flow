import React, { useContext, useEffect, useState } from 'react';
import './AnalyzeScreen.css';
import { FileContext } from './FileContext';
import axios from 'axios';

function AnalyzeScreen() {
  const { uploadedFiles } = useContext(FileContext);
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    const analyzeFiles = async () => {
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append('files', file));

      try {
        const response = await axios.post('/api/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const results = response.data.data.reduce((acc, file) => {
          acc[file.filename] = file.analysis;
          return acc;
        }, {});

        setAnalysisResults(results);
      } catch (error) {
        console.error("Error analyzing files:", error);
        setAnalysisResults({ error: "Error analyzing files" });
      }
    };

    if (uploadedFiles.length > 0) analyzeFiles();
  }, [uploadedFiles]);

  return (
    <div className="AnalyzeScreen">
      <h1>File Analysis Results</h1>
      <div className="content">
        {Object.keys(analysisResults).length === 0
          ? <p>Analyzing Files...</p>
          : Object.entries(analysisResults).map(([filename, analysis]) => (
              <div key={filename} className="fileSection">
                {Object.entries(analysis).map(([section, content]) => (
                  <div key={section} className="analysisSection">
                    <h3>{section}</h3>
                    <p>{content}</p>
                  </div>
                ))}
              </div>
            ))}
      </div>
    </div>
  );
}

export default AnalyzeScreen;
