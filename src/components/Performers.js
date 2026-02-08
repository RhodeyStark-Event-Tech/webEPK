import './Performers.css';

const Performers = () => {
  const performers = [
    {
      id: 1,
      name: 'The Sessions',
      category: 'Live Music',
      description: 'Versatile cover band specializing in rock, pop, and jazz classics.',
      image:'',
      audio:'',
      video:''
    },
    {
      id: 2,
      name: 'NOSTALGIA',
      category: 'Live Music',
      description: 'The finest vocalists and instrumentalists playing the greatest hits of all time. Guaranteed to get everyone on the dance floor.',
      image:'',
      audio:'',
      video:''
    },
    {
      id: 3,
      name: 'Dynamic Duo DJs',
      category: 'DJ Services',
      description: 'High-energy DJ team keeping the dance floor packed all night long.',
      image:'',
      audio:'',
      video:''
    },
    {
      id: 4,
      name: 'Spark Entertainment',
      category: 'Fire Performance',
      description: 'Mesmerizing fire dancers and LED performers for spectacular shows.',
      image:'',
      audio:'',
      video:''
    },
    {
      id: 5,
      name: 'Comedy Kings',
      category: 'Stand-up Comedy',
      description: 'Professional comedians delivering clean, crowd-pleasing humor.',
      image:'',
      audio:'',
      video:''
    },
    {
      id: 6,
      name: 'String Quartet Elegance',
      category: 'Classical Music',
      description: 'Sophisticated classical ensemble perfect for formal occasions.',
      image:'',
      audio:'',
      video:''
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
          Discover our talented roster of performers ready to bring your event to life.
        </p>
        <div
          className="performers-grid"
          role="list"
          aria-describedby="performers-description"
        >
          {performers.map(({ id, name, category, description, image, audio, video }) => (
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
