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
    <section id="performers" className="performers-section">
      <div className="performers-container">
        <h2>Our Performers</h2>
        <p className="performers-intro">
          Discover our talented roster of performers ready to bring your event to life
        </p>
        <div className="performers-grid">
          {performers.map(({ id, name, category, description }) => (
            <div key={id} className="performer-card">
              <div className="performer-image">
                <div className="image-placeholder">
                  <span>{name.charAt(0)}</span>
                </div>
              </div>
              <div className="performer-info">
                <span className="performer-category">{category}</span>
                <h3>{name}</h3>
                <p>{description}</p>
                <button className="book-btn">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Performers;
