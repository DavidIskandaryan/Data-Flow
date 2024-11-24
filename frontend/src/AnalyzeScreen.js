import React, { useContext, useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
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

  const handleDownload = () => {
    const doc = new jsPDF();
    let yPos = 20;
  
    doc.setFontSize(24);
    doc.text('AI Financial Analysis Results', 105, yPos, { align: 'center' });
    yPos += 20;
  
    const pageWidth = 190;
    const pageHeight = 280;
    const leftMargin = 20;
    const rightMargin = 20;
  
    Object.entries(analysisResults).forEach(([section, content]) => {
      doc.setFontSize(16);
      if (yPos + 10 > pageHeight) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(section, leftMargin, yPos);
      yPos += 10;
  
      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(content, pageWidth - leftMargin - rightMargin);
  
      splitContent.forEach((line) => {
        if (yPos + 7 > pageHeight) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 7;
      });
  
      yPos += 10;
    });
  
    doc.save('financial-analysis.pdf');
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
        <h1>Analyzing Files with Data Flow...</h1>
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
      {analysisResults && (
        <>
          {Object.entries(analysisResults).map(([section, content]) => (
            <div key={section} className="analysisSection">
              <h3>{section}</h3>
              <div className="analysisContent">
                <p>{content}</p>
              </div>
            </div>
          ))}
          <div className="analyzeButtonContainer">
            <button className="analyzeUploadButton" onClick={handleDownload}>Download</button>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyzeScreen;