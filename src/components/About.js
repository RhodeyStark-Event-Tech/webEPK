import React from 'react';
import './About.css';

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-hero">
        <h1>Welcome to ServicePromo</h1>
        <p className="tagline">Elevating Your Events with Exceptional Talent</p>
      </div>
      <div className="about-content">
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            ServicePromo is a premier talent management and event services company
            dedicated to bringing extraordinary performances to your special occasions.
            With years of experience in the entertainment industry, we connect you with
            talented performers who will make your event unforgettable.
          </p>
          <p>
            Whether you're planning a corporate event, wedding, private party, or
            public festival, we have the perfect performers to match your vision and
            exceed your expectations.
          </p>
        </div>
        <div className="about-features">
          <div className="feature">
            <div className="feature-icon">&#9733;</div>
            <h3>Premium Talent</h3>
            <p>Handpicked performers with proven track records</p>
          </div>
          <div className="feature">
            <div className="feature-icon">&#9829;</div>
            <h3>Personalized Service</h3>
            <p>Customized entertainment solutions for every event</p>
          </div>
          <div className="feature">
            <div className="feature-icon">&#10004;</div>
            <h3>Reliability</h3>
            <p>Professional coordination from booking to performance</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
