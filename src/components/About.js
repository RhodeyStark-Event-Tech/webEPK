import "./About.css";

const About = () => {
  const features = [
    {
      icon: "\u2733",
      title: "Premium Talent",
      description: "Handpicked performers with proven track records",
    },
    {
      icon: "\u2665",
      title: "Personalized Service",
      description: "Customized entertainment solutions for every event",
    },
    {
      icon: "\u2714",
      title: "Reliability",
      description: "Professional coordination from booking to performance",
    },
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
          FUN. EASY. KNOWLEDGABLE.
        </p>
      </div>
      <div className="about-content">
        <div className="about-text">
          <h2 id="who-we-are">Who We Are</h2>
          <p>
            We love what we do. FUN is what creates memorable moments at events.
            It’s not only the goal of the event, but its why our clients choose
            us. Events can be complicated. Our objective is to make them EASY by
            ensuring transparent communication, experienced professionals who
            specialize in talent booking, talent management, and event
            production at the helm of your event steering it in the right
            direction. The backbone of our company is understanding our client’s
            event goals and process. We take painstaking efforts to be
            KNOWLEDGABLE in a variety of solutions that create results.
          </p>
          <p>
            Whether you're planning a corporate event, wedding, private party,
            or public festival, we have the perfect performers to match your
            vision and exceed your expectations.
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
              aria-labelledby={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <div className="feature-icon" aria-hidden="true">
                {icon}
              </div>
              <h3 id={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}>
                {title}
              </h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
