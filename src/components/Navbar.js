import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ activeSection, onNavClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'performers', label: 'Performers' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        <div className="navbar-logo">
          <button
            onClick={() => onNavClick('about')}
            aria-label="RhodeyStark Events - Go to About section"
            className="logo-button"
          >
            <img
              src="/assets/RSlogo.png"
              alt="RhodeyStark Events"
              className="logo-image"
            />
          </button>
        </div>
        <ul className="navbar-menu" role="menubar" aria-label="Site sections">
          {navItems.map(({ id, label }) => (
            <li key={id} className="navbar-item" role="none">
              <button
                role="menuitem"
                className={`navbar-link ${activeSection === id ? 'active' : ''}`}
                onClick={() => onNavClick(id)}
                aria-current={activeSection === id ? 'page' : undefined}
                aria-label={`Navigate to ${label} section`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
