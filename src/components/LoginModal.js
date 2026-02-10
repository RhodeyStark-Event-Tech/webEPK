import { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Super admin - full access including uploads
    if (email === 'omaurbliss@gmail.com' && password === '102078') {
      onSuccess({ isSuperAdmin: true });
      setEmail('');
      setPassword('');
      return;
    }

    // General admin - access to About, Performers, Contact (no uploads)
    if (password === '54321') {
      onSuccess({ isSuperAdmin: false });
      setEmail('');
      setPassword('');
      return;
    }

    setError('Invalid email or password');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <img
            src="/assets/RSlogo.png"
            alt="RhodeyStark Events"
            className="login-logo-image"
          />
        </div>

        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">
          Please enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
