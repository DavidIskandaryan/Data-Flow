import React, { useContext, useEffect, useState } from 'react';
import './AnalyzeScreen.css';
import { FileContext } from './FileContext';
import axios from 'axios';

function AnalyzeScreen() {
  const { uploadedFiles } = useContext(FileContext);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cleanAnalysisText = (text) => {
    return text.replace(/[#*•-]/g, '').trim();
  };

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
        
        const result = response.data.data[0];
        const cleanedAnalysis = Object.fromEntries(
          Object.entries(result.analysis).map(([key, value]) => [
            key,
            cleanAnalysisText(value)
          ])
        );
        
        setAnalysisResults(cleanedAnalysis);
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
        <div className="loading">This may take a few minutes.</div>
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
      <h1>AI Financial Analysis Results</h1>
      {analysisResults && Object.entries(analysisResults).map(([section, content]) => (
        <div key={section} className="analysisSection">
          <h3>{section}</h3>
          <div className="analysisContent">
            <p>{content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyzeScreen;