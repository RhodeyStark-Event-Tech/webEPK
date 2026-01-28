import './About.css';

const About = () => {
  const features = [
    { icon: '\u2733', title: 'Premium Talent', description: 'Handpicked performers with proven track records' },
    { icon: '\u2665', title: 'Personalized Service', description: 'Customized entertainment solutions for every event' },
    { icon: '\u2714', title: 'Reliability', description: 'Professional coordination from booking to performance' }
  ];

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
          {features.map(({ icon, title, description }) => (
            <div key={title} className="feature">
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
