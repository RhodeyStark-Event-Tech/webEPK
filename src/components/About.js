import { useEffect, useRef } from "react";
import "./About.css";

const VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/rs-epk.firebasestorage.app/o/media%2FSessions10pc.mp4?alt=media&token=d820a08e-cdf5-4236-98c8-6bc793122e51';

const About = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 15) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

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
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-text">
          <h1 id="about-heading" className="hero-title">RhodeyStark Events</h1>
          <p className="tagline" role="doc-subtitle">
            <span className="tagline-word tagline-fun">FUN.</span>
            <span className="tagline-word tagline-easy">EASY.</span>
            <span className="tagline-word tagline-knowledgable">KNOWLEDGABLE.</span>
          </p>
        </div>
      </div>
      <div className="about-content">
        <div className="about-text" id="who-we-are">
          <h2>Who We Are</h2>
          <p>
            We love what we do. FUN is what creates memorable moments at events.
            It's not only the goal of the event, but its why our clients choose
            us. Events can be complicated. Our objective is to make them EASY by
            ensuring transparent communication, experienced professionals who
            specialize in talent booking, talent management, and event
            production at the helm of your event steering it in the right
            direction. The backbone of our company is understanding our client's
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
