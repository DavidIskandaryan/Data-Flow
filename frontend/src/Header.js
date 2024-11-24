import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Header.css';
import logoImage from './Images/Data Flow logo.png';

function Header() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
  
    const handleLogout = () => {
        logout();
        navigate('/');
    };
  
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
                {user ? (
                    <button className="headerButton" onClick={handleLogout}>
                        Sign Out
                    </button>
                ) : (
                    <button className="headerButton" onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;