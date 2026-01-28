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
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">ServicePromo</span>
        </div>
        <ul className="navbar-menu">
          {navItems.map(({ id, label }) => (
            <li key={id} className="navbar-item">
              <button
                className={`navbar-link ${activeSection === id ? 'active' : ''}`}
                onClick={() => onNavClick(id)}
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
