import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warn('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <span className="auth-hero-icon" style={{ fontSize: '2.2rem', fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>M</span>
            <h1>MedVault</h1>
            <p>Your personal health records, always accessible, always secure.</p>
            <div className="auth-hero-features">
              <div className="hero-feature">Track prescriptions and medicines</div>
              <div className="hero-feature">Monitor health vitals</div>
              <div className="hero-feature">Secure and private</div>
            </div>
          </div>
        </div>
        <div className="auth-form-section">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to access your health records</p>

            <div className="input-group">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="login-email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <MdLock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                id="login-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
