import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoImage from './Images/Data Flow logo.png';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <img 
        src={logoImage} 
        alt="Data Flow Logo" 
        className="headerLogo" 
        onClick={() => navigate('/')}
      />
      <div className="headerButtons">
        <button className="headerButton" onClick={() => navigate('/lists')}>
          Upload
        </button>
        <button className="headerButton" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    </header>
  );
}

export default Header;