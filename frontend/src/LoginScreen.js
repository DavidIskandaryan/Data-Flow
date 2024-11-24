import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthScreen.css';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      login(response.data);
      navigate('/');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="authScreen">
      <div className="authContainer">
        <h1>Login</h1>
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
          <button type="submit" className="authButton">Login</button>
        </form>
        <p className="authToggle">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;