import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';
import companyImage from './Images/Businessman.jpg';

function WelcomeScreen() {
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate("/lists");
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