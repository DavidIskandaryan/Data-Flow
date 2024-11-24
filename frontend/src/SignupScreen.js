import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import './AuthScreen.css';

function SignupScreen() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post('/api/auth/signup', { email, password });
        const loginResponse = await axios.post('/api/auth/login', { email, password });
        login(loginResponse.data);
        navigate('/');
      } catch (error) {
        alert('Error creating account');
      }
    };

    return (
        <div className="authScreen">
            <div className="authContainer">
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit} className="authForm">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="authButton">Sign Up</button>
                </form>
                <p className="authToggle">
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')}>Login</span>
                </p>
            </div>
        </div>
    );
}

export default SignupScreen;