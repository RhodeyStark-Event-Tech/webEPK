import './Performers.css';

const Performers = () => {
  const performers = [
    {
      id: 1,
      name: 'The Midnight Band',
      category: 'Live Music',
      description: 'Versatile cover band specializing in rock, pop, and jazz classics.'
    },
    {
      id: 2,
      name: 'Elena Martinez',
      category: 'Solo Artist',
      description: 'Award-winning vocalist with a powerful range and captivating stage presence.'
    },
    {
      id: 3,
      name: 'Dynamic Duo DJs',
      category: 'DJ Services',
      description: 'High-energy DJ team keeping the dance floor packed all night long.'
    },
    {
      id: 4,
      name: 'Spark Entertainment',
      category: 'Fire Performance',
      description: 'Mesmerizing fire dancers and LED performers for spectacular shows.'
    },
    {
      id: 5,
      name: 'Comedy Kings',
      category: 'Stand-up Comedy',
      description: 'Professional comedians delivering clean, crowd-pleasing humor.'
    },
    {
      id: 6,
      name: 'String Quartet Elegance',
      category: 'Classical Music',
      description: 'Sophisticated classical ensemble perfect for formal occasions.'
    }
  ];

  return (
    <section
      id="performers"
      className="performers-section"
      role="region"
      aria-labelledby="performers-heading"
    >
      <div className="performers-container">
        <h2 id="performers-heading">Our Performers</h2>
        <p className="performers-intro" id="performers-description">
          Discover our talented roster of performers ready to bring your event to life
        </p>
        <div
          className="performers-grid"
          role="list"
          aria-describedby="performers-description"
        >
          {performers.map(({ id, name, category, description }) => (
            <article
              key={id}
              className="performer-card"
              role="listitem"
              aria-labelledby={`performer-name-${id}`}
            >
              <div className="performer-image" aria-hidden="true">
                <div className="image-placeholder">
                  <span>{name.charAt(0)}</span>
                </div>
              </div>
              <div className="performer-info">
                <span className="performer-category" aria-label={`Category: ${category}`}>
                  {category}
                </span>
                <h3 id={`performer-name-${id}`}>{name}</h3>
                <p>{description}</p>
                <button
                  className="book-btn"
                  aria-label={`Learn more about ${name}`}
                >
                  Learn More
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Performers;
