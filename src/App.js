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
      <Navbar activeSection={activeSection} onNavClick={scrollToSection} />
      <main>
        <About />
        <Performers />
        <Contact />
      </main>
      <footer className="footer">
        <p>&copy; 2026 Service Promo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
