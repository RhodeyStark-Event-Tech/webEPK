import { useState } from 'react';
import Modal from './Modal';
import './Performers.css';

const Performers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const performers = [
    {
      id: 1,
      name: 'The Midnight Band',
      category: 'Live Music',
      description: 'Versatile cover band specializing in rock, pop, and jazz classics.',
      media: {
        type: 'video',
        src: '/assets/media/midnight-band.mp4',
        title: 'The Midnight Band - Live Performance',
        description: 'Watch The Midnight Band in action at a recent corporate event.'
      }
    },
    {
      id: 2,
      name: 'Elena Martinez',
      category: 'Solo Artist',
      description: 'Award-winning vocalist with a powerful range and captivating stage presence.',
      media: {
        type: 'audio',
        src: '/assets/media/elena-martinez.mp3',
        title: 'Elena Martinez - Demo Reel',
        description: 'Listen to Elena\'s stunning vocal performances.'
      }
    },
    {
      id: 3,
      name: 'Dynamic Duo DJs',
      category: 'DJ Services',
      description: 'High-energy DJ team keeping the dance floor packed all night long.',
      media: {
        type: 'video',
        src: '/assets/media/dynamic-djs.mp4',
        title: 'Dynamic Duo DJs - Club Set',
        description: 'Experience the energy of Dynamic Duo DJs live mixing.'
      }
    },
    {
      id: 4,
      name: 'Spark Entertainment',
      category: 'Fire Performance',
      description: 'Mesmerizing fire dancers and LED performers for spectacular shows.',
      media: {
        type: 'video',
        src: '/assets/media/spark-entertainment.mp4',
        title: 'Spark Entertainment - Fire Show',
        description: 'Watch our breathtaking fire performance highlights.'
      }
    },
    {
      id: 5,
      name: 'Comedy Kings',
      category: 'Stand-up Comedy',
      description: 'Professional comedians delivering clean, crowd-pleasing humor.',
      media: {
        type: 'video',
        src: '/assets/media/comedy-kings.mp4',
        title: 'Comedy Kings - Best Moments',
        description: 'Get a taste of the laughs with Comedy Kings\' best bits.'
      }
    },
    {
      id: 6,
      name: 'String Quartet Elegance',
      category: 'Classical Music',
      description: 'Sophisticated classical ensemble perfect for formal occasions.',
      media: {
        type: 'audio',
        src: '/assets/media/string-quartet.mp3',
        title: 'String Quartet Elegance - Classical Selections',
        description: 'Sample our elegant classical music repertoire.'
      }
    }
  ];

  const handleLearnMore = (performer) => {
    setSelectedMedia(performer.media);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

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
          {performers.map(({ id, name, category, description, media }) => (
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
                  onClick={() => handleLearnMore({ name, media })}
                  aria-label={`Learn more about ${name}`}
                >
                  Learn More
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
      />
    </section>
  );
};

export default Performers;
