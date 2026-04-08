import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPass) return toast.warn('Please fill in all fields');
    if (password.length < 6) return toast.warn('Password must be at least 6 characters');
    if (password !== confirmPass) return toast.warn('Passwords do not match');
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
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
              <div className="hero-feature">Family health profiles</div>
              <div className="hero-feature">Appointment scheduling</div>
              <div className="hero-feature">Emergency info card</div>
            </div>
          </div>
        </div>
        <div className="auth-form-section">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Start managing your health records today</p>

            <div className="input-group">
              <MdPerson className="input-icon" />
              <input
                type="text"
                id="register-name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="input-group">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="register-email"
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
                id="register-password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            <div className="input-group">
              <MdLock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                id="register-confirm-password"
                placeholder="Confirm password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-submit">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
