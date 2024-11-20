import React, { useContext, useEffect, useState } from 'react';
import './AnalyzeScreen.css';
import { FileContext } from './FileContext';
import axios from 'axios';

function AnalyzeScreen() {
  const { uploadedFiles } = useContext(FileContext);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyzeFiles = async () => {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append('files', file));

      try {
        const response = await axios.post('/api/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setAnalysisResults(response.data.data);
      } catch (error) {
        console.error("Error analyzing files:", error);
        setError("Error analyzing files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (uploadedFiles.length > 0) {
      analyzeFiles();
    }
  }, [uploadedFiles]);

  if (loading) {
    return (
      <div className="AnalyzeScreen">
        <h1>Analyzing Files...</h1>
        <div className="loading">Please wait while we analyze your files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="AnalyzeScreen">
        <h1>Analysis Error</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="AnalyzeScreen">
      <h1>Financial Analysis Results</h1>
      {analysisResults.map((fileResult, fileIndex) => (
        <div key={fileIndex} className="fileSection">
          <h2>{fileResult.filename}</h2>
          {Object.entries(fileResult.analysis).map(([section, content], sectionIndex) => (
            <div key={sectionIndex} className="analysisSection">
              <h3>{section}</h3>
              <div className="analysisContent">
                <p>{content}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AnalyzeScreen;