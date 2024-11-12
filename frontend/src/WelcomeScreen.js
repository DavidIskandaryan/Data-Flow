import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';
import companyImage from './Images/Businessman.jpg';

function WelcomeScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      navigate("/lists");
    } else {
      alert("Please select at least one file.");
    }
  };

  return (
    <div className="companySection">
      <div className="imageContainer">
        <img src={companyImage} alt="Company Vision" className="companyImage" />
      </div>
      <div className="companyContent">
        <div className="topContent">
          <h1>Welcome</h1>
          <p className="welcomeText">Upload earning statements to be analyzed by our AI model and receive tailored consulting and recommendations for your business instantly.</p>
          <button onClick={handleUpload} className="uploadButton">Upload</button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div className="bottomContent">
          <h2>Data Flow</h2>
          <p className="companyDescription">
            Data Flow leverages AI and machine learning to analyze inefficiencies in your business and suggest improvements to maximize profit in a simple, easy-to-understand way. Starting with removing those overpriced consultancy fees you are paying to get information that could be just a few clicks away with us.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
