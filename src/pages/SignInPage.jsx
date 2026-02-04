import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, resetPassword } from '../api';
import './Auth.css';

const VIEW_SIGNIN = 'signin';
const VIEW_SIGNUP = 'signup';
const VIEW_FORGOT = 'forgot';
const VIEW_FORGOT_SENT = 'forgot-sent';
const VIEW_RESET = 'reset';
const VIEW_RESET_SUCCESS = 'reset-success';

export default function SignInPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [view, setView] = useState(VIEW_SIGNIN);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tokenFromUrl) {
      setView(VIEW_RESET);
      setError('');
    }
  }, [tokenFromUrl]);

  const clearToken = () => {
    searchParams.delete('token');
    setSearchParams(searchParams, { replace: true });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname;
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name);
      const from = location.state?.from?.pathname;
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setForgotEmail(email);
      setResetLink(res.resetLink || '');
      setView(VIEW_FORGOT_SENT);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!tokenFromUrl) {
      setError('Missing reset token. Use the link from your email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(tokenFromUrl, password);
      setView(VIEW_RESET_SUCCESS);
      clearToken();
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (view === VIEW_RESET_SUCCESS) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Password reset</h1>
          <p>Your password has been updated. You can now sign in.</p>
          <button type="button" className="auth-submit" onClick={() => setView(VIEW_SIGNIN)}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (tokenFromUrl && view === VIEW_RESET) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Set new password</h1>
          <form onSubmit={handleReset}>
            {error && <div className="auth-error">{error}</div>}
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
          <p className="auth-links">
            <button type="button" className="auth-link-btn" onClick={() => { clearToken(); setView(VIEW_SIGNIN); }}>
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (view === VIEW_FORGOT_SENT) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p>If an account exists for {forgotEmail}, use the link below to reset your password.</p>
          {resetLink && (
            <div className="reset-link-box">
              <p>Copy this link (dev mode – email may not be sent):</p>
              <input
                type="text"
                readOnly
                value={resetLink}
                onFocus={(e) => e.target.select()}
                className="reset-link-input"
              />
            </div>
          )}
          <p className="auth-links">
            <button type="button" className="auth-link-btn" onClick={() => setView(VIEW_SIGNIN)}>
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (view === VIEW_FORGOT) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Forgot password</h1>
          <form onSubmit={handleForgot}>
            {error && <div className="auth-error">{error}</div>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <p className="auth-links">
            <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW_SIGNIN); setError(''); }}>
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--tabs">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${view === VIEW_SIGNIN ? 'auth-tab--active' : ''}`}
            onClick={() => { setView(VIEW_SIGNIN); setError(''); }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab ${view === VIEW_SIGNUP ? 'auth-tab--active' : ''}`}
            onClick={() => { setView(VIEW_SIGNUP); setError(''); }}
          >
            Sign up
          </button>
        </div>

        {view === VIEW_SIGNIN && (
          <>
            <h1 className="auth-title">Sign in</h1>
            <form onSubmit={handleSignIn}>
              {error && <div className="auth-error">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="auth-links auth-links--stack">
              <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW_FORGOT); setError(''); }}>
                Forgot password?
              </button>
              <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW_SIGNUP); setError(''); }}>
                Create account
              </button>
            </p>
          </>
        )}

        {view === VIEW_SIGNUP && (
          <>
            <h1 className="auth-title">Create account</h1>
            <form onSubmit={handleSignUp}>
              {error && <div className="auth-error">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Creating…' : 'Sign up'}
              </button>
            </form>
            <p className="auth-links">
              <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW_SIGNIN); setError(''); }}>
                Already have an account? Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
