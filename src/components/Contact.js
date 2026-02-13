import './Contact.css';

const BOOKING_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScjkQJ-zXpR-GW-cXaXnpCyiX0vU_vemeCXL7g4weWQhfCKiA/viewform?usp=sharing&ouid=111455180566421488224';

const Contact = () => {
  return (
    <section
      id="contact"
      className="contact-section"
      role="region"
      aria-labelledby="contact-heading"
    >
      <div className="contact-container">
        <h2 id="contact-heading">Contact Us</h2>
        <p className="contact-intro" id="contact-description">
          Ready to book? Have questions? We'd love to hear from you!
        </p>
        <div className="contact-content">
          <div
            className="contact-info"
            role="complementary"
            aria-label="Contact information"
          >
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <a href="mailto:info@rhodeystark.com" className="info-link">
                  info@rhodeystark.com
                </a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="info-content">
                <h3>Website</h3>
                <a
                  href="https://www.rhodeystark.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  www.rhodeystark.com
                </a>
              </div>
            </div>
          </div>

          <div className="contact-cta">
            <p className="cta-text">Ready to make your event unforgettable?</p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
              aria-label="Contact us - opens booking form in new tab"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
