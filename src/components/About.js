import './About.css';

const About = () => {
  const features = [
    { icon: '\u2733', title: 'Premium Talent', description: 'Handpicked performers with proven track records' },
    { icon: '\u2665', title: 'Personalized Service', description: 'Customized entertainment solutions for every event' },
    { icon: '\u2714', title: 'Reliability', description: 'Professional coordination from booking to performance' }
  ];

  return (
    <section
      id="about"
      className="about-section"
      role="region"
      aria-labelledby="about-heading"
    >
      <div className="about-hero">
        <h1 id="about-heading">Welcome to ServicePromo</h1>
        <p className="tagline" role="doc-subtitle">
          Elevating Your Events with Exceptional Talent
        </p>
      </div>
      <div className="about-content">
        <div className="about-text">
          <h2 id="who-we-are">Who We Are</h2>
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
        <div
          className="about-features"
          role="list"
          aria-label="Our key features"
        >
          {features.map(({ icon, title, description }) => (
            <article
              key={title}
              className="feature"
              role="listitem"
              aria-labelledby={`feature-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className="feature-icon" aria-hidden="true">{icon}</div>
              <h3 id={`feature-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
