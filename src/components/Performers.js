import { useState, useEffect } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import OptimizedImage from './OptimizedImage';
import { getPerformers } from '../firebase/performerService';
import './Performers.css';

const Performers = ({ initialData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaList, setSelectedMediaList] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [performers, setPerformers] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Skip fetching if initialData was provided
    if (initialData) {
      setPerformers(initialData);
      setIsLoading(false);
      return;
    }

    const fetchPerformers = async () => {
      try {
        const data = await getPerformers();
        setPerformers(data);
      } catch (error) {
        console.error('Error fetching performers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformers();
  }, [initialData]);

  const handleLearnMore = (performer) => {
    setModalTitle(performer.name);

    // Check for new mediaList format (multiple media)
    if (performer.mediaList && performer.mediaList.length > 0) {
      setSelectedMediaList(performer.mediaList);
      setSelectedMedia(null);
      setIsModalOpen(true);
      return;
    }

    // Legacy support: single media
    if (performer.media) {
      setSelectedMedia({
        ...performer.media,
        description: performer.name
      });
      setSelectedMediaList(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    setSelectedMediaList(null);
    setModalTitle('');
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
          Discover our talented roster of performers ready to bring your event to life.
        </p>

        {isLoading ? (
          <div className="performers-loading">
            <Spinner size="large" color="dark" text="Loading performers..." />
          </div>
        ) : (
          <div
            className="performers-grid"
            role="list"
            aria-describedby="performers-description"
          >
            {performers.map(({ id, name, category, description, media, mediaList, photo }) => {
              const hasMedia = (mediaList && mediaList.length > 0) || media;
              return (
                <article
                  key={id}
                  className="performer-card"
                  role="listitem"
                  aria-labelledby={`performer-name-${id}`}
                >
                  <div className="performer-image" aria-hidden="true">
                    {photo ? (
                      <OptimizedImage
                        src={photo.src}
                        alt={name}
                        className="light-theme"
                        placeholderColor="#e9ecef"
                        aspectRatio="1/1"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>{name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="performer-info">
                    <span className="performer-category" aria-label={`Category: ${category}`}>
                      {category}
                    </span>
                    <h3 id={`performer-name-${id}`}>{name}</h3>
                    <p>{description}</p>
                    {hasMedia ? (
                      <button
                        className="book-btn"
                        onClick={() => handleLearnMore({ name, media, mediaList })}
                        aria-label={`Learn more about ${name}`}
                      >
                        Learn More
                      </button>
                    ) : (
                      <span className="no-media-text">Media coming soon</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
        mediaList={selectedMediaList}
        title={modalTitle}
      />
    </section>
  );
};

export default Performers;
