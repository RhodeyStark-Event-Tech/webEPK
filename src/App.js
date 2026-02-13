import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import About from './components/About';
import Performers from './components/Performers';
import Contact from './components/Contact';
import Cards from './components/Cards';
import Uploads from './components/Uploads';
import CardManagement from './components/CardManagement';
import LoginModal from './components/LoginModal';
import Spinner from './components/Spinner';
import { getPerformers } from './firebase/performerService';
import { getCards } from './firebase/cardService';
import './App.css';

const App = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [performers, setPerformers] = useState([]);
  const [cards, setCards] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = async ({ isSuperAdmin: superAdmin }) => {
    setIsSuperAdmin(superAdmin);

    // For general admin, show loading screen while fetching data
    if (!superAdmin) {
      setIsLoadingData(true);
      try {
        const [performersData, cardsData] = await Promise.all([
          getPerformers(),
          getCards()
        ]);
        setPerformers(performersData);
        setCards(cardsData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Still allow access even if fetch fails
        setDataLoaded(true);
      } finally {
        setIsLoadingData(false);
        setIsAuthenticated(true);
      }
    } else {
      // Super admin gets immediate access
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setActiveSection('about');
    setDataLoaded(false);
    setPerformers([]);
    setCards([]);
  };

  // Show login page if not authenticated
  if (!isAuthenticated && !isLoadingData) {
    return (
      <ToastProvider>
        <LoginModal onSuccess={handleLoginSuccess} />
      </ToastProvider>
    );
  }

  // Show loading overlay for general admin while fetching data
  if (isLoadingData) {
    return (
      <div className="app-loading-overlay">
        <div className="app-loading-content">
          <Spinner size="large" color="white" />
          <p className="app-loading-text">loading talent...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
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
          <Performers initialData={dataLoaded ? performers : null} />
          <Cards initialData={dataLoaded ? cards : null} />
          <Contact />
          {isSuperAdmin && <Uploads />}
          {isSuperAdmin && <CardManagement />}
        </main>
        <footer className="footer" role="contentinfo">
          <p>&copy; 2026 RhodeyStark Events. All rights reserved.</p>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;
