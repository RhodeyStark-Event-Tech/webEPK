import { useState } from 'react';
import Navbar from './components/Navbar';
import About from './components/About';
import Performers from './components/Performers';
import Contact from './components/Contact';
import Cards from './components/Cards';
import Uploads from './components/Uploads';
import CardManagement from './components/CardManagement';
import LoginModal from './components/LoginModal';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = ({ isSuperAdmin: superAdmin }) => {
    setIsAuthenticated(true);
    setIsSuperAdmin(superAdmin);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setActiveSection('about');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginModal onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header role="banner">
        <Navbar
          activeSection={activeSection}
          onNavClick={scrollToSection}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
      </header>
      <main id="main-content" role="main" aria-label="Main content">
        <About />
        <Performers />
        <Cards />
        <Contact />
        {isSuperAdmin && <Uploads />}
        {isSuperAdmin && <CardManagement />}
      </main>
      <footer className="footer" role="contentinfo">
        <p>&copy; 2026 RhodeyStark Events. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
