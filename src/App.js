import { useState } from 'react';
import Navbar from './components/Navbar';
import About from './components/About';
import Performers from './components/Performers';
import Contact from './components/Contact';
import Uploads from './components/Uploads';
import LoginModal from './components/LoginModal';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUploadsClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    setTimeout(() => {
      scrollToSection('uploads');
    }, 100);
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header role="banner">
        <Navbar
          activeSection={activeSection}
          onNavClick={scrollToSection}
          onUploadsClick={handleUploadsClick}
          isAuthenticated={isAuthenticated}
        />
      </header>
      <main id="main-content" role="main" aria-label="Main content">
        <About />
        <Performers />
        <Contact />
        <Uploads isAuthenticated={isAuthenticated} />
      </main>
      <footer className="footer" role="contentinfo">
        <p>&copy; 2026 RhodeyStark Events. All rights reserved.</p>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
