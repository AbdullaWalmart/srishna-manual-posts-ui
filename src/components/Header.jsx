import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLinks = user ? (
    <>
      <span className="header-user" title={user.email}>
        {user.name || user.email}
      </span>
      <Link to="/" className="header-link" onClick={() => setMenuOpen(false)}>Posts</Link>
      <Link to="/upload" className="header-link" onClick={() => setMenuOpen(false)}>Upload</Link>
      <button type="button" className="header-link header-link--btn" onClick={handleLogout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/" className="header-link" onClick={() => setMenuOpen(false)}>Posts</Link>
      <Link to="/upload" className="header-link" onClick={() => setMenuOpen(false)}>Upload</Link>
      <Link to="/login" className="header-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
    </>
  );

  return (
    <header className="header">
      <div className="header-inner" ref={menuRef}>
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
        </Link>
        <nav className="header-nav header-nav--desktop">
          {navLinks}
        </nav>
        <button
          type="button"
          className="header-burger"
          aria-label="Open menu"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        >
          <span className="header-burger-bar" />
          <span className="header-burger-bar" />
          <span className="header-burger-bar" />
        </button>
        {menuOpen && (
          <nav className="header-nav header-nav--mobile">
            {navLinks}
          </nav>
        )}
      </div>
    </header>
  );
}
