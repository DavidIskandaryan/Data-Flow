import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthScreen.css';

function SignupScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement signup logic
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