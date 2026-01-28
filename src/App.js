import { useState } from 'react';
import Navbar from './components/Navbar';
import About from './components/About';
import Performers from './components/Performers';
import Contact from './components/Contact';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('about');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header role="banner">
        <Navbar activeSection={activeSection} onNavClick={scrollToSection} />
      </header>
      <main id="main-content" role="main" aria-label="Main content">
        <About />
        <Performers />
        <Contact />
      </main>
      <footer className="footer" role="contentinfo">
        <p>&copy; 2026 Service Promo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
