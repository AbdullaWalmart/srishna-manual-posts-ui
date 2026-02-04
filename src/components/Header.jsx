import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-img-wrap">
            <img
              src={logoSrc}
              alt="Srishna"
              className="logo-img"
              onError={() => setLogoSrc('/favicon.svg')}
            />
          </span>
          <span className="logo-text">Srishna</span>
          <span className="logo-sub">Manual Posts</span>
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <span className="header-user" title={user.email}>
                {user.name || user.email}
              </span>
              <Link to="/" className="header-link">Posts</Link>
              <Link to="/upload" className="header-link">Upload</Link>
              <button type="button" className="header-link header-link--btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="header-link">Posts</Link>
              <Link to="/upload" className="header-link">Upload</Link>
              <Link to="/login" className="header-link">Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
