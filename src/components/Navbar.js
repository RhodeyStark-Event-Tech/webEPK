import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ activeSection, onNavClick, isSuperAdmin, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'performers', label: 'Performers' },
    { id: 'contact', label: 'Contact' },
    { id: 'uploads', label: 'Uploads', superAdminOnly: true }
  ];

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(
    item => !item.superAdminOnly || isSuperAdmin
  );

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
          {visibleNavItems.map((item) => (
            <li key={item.id} className="navbar-item" role="none">
              <button
                role="menuitem"
                className={`navbar-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onNavClick(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
                aria-label={`Navigate to ${item.label} section`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="logout-btn"
          onClick={onLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
