import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="footer-logo" aria-label="Srishna home">
          <span className="footer-logo-img-wrap">
            <img
              src={logoSrc}
              alt="Srishna"
              className="footer-logo-img"
              onError={() => setLogoSrc('/favicon.svg')}
            />
          </span>
          <span className="footer-logo-text">Srishna</span>
        </Link>
        <span className="footer-copy">© {new Date().getFullYear()} Srishna. All rights reserved.</span>
      </div>
    </footer>
  );
}
