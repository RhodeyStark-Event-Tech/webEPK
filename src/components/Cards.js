import { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import { getCards } from '../firebase/cardService';
import './Cards.css';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Fetch cards from Firebase
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cardsData = await getCards();
      setCards(cardsData);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Handle card click to view media
  const handleCardClick = (card) => {
    if (card.media) {
      setSelectedMedia({
        ...card.media,
        description: card.title
      });
      setIsModalOpen(true);
    } else if (card.photo) {
      setSelectedMedia({
        type: 'image',
        src: card.photo.src,
        title: card.photo.name || card.title,
        description: card.title
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  }, []);

  return (
    <section
      id="cards"
      className="cards-section"
      role="region"
      aria-labelledby="cards-heading"
    >
      <div className="cards-container">
        <h2 id="cards-heading">Featured Content</h2>
        <p className="cards-intro">
          Explore our latest promotions and announcements
        </p>

        {isLoading && (
          <div className="cards-loading">
            <p>Loading content...</p>
          </div>
        )}

        {error && (
          <div className="cards-error">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && cards.length === 0 && (
          <div className="cards-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-4h4v-2h-4V7h-2v4H8v2h4z"/>
            </svg>
            <p>No content available yet.</p>
            <p className="empty-hint">Check back soon for new promotions and announcements!</p>
          </div>
        )}

        {cards.length > 0 && (
          <div className="cards-grid">
            {cards.map((card) => (
              <article
                key={card.id}
                className={`promo-card ${card.media || card.photo ? 'has-media' : ''}`}
                onClick={() => handleCardClick(card)}
                role={card.media || card.photo ? 'button' : 'article'}
                tabIndex={card.media || card.photo ? 0 : undefined}
                onKeyDown={(e) => {
                  if ((card.media || card.photo) && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleCardClick(card);
                  }
                }}
                aria-label={card.media || card.photo ? `View ${card.title}` : card.title}
              >
                <div className="promo-card-image">
                  {card.photo ? (
                    <img src={card.photo.src} alt={card.title} />
                  ) : (
                    <div className="promo-card-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  )}
                  {card.media && (
                    <div className="media-overlay">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {card.category && (
                  <span className="promo-card-category">{card.category}</span>
                )}

                <div className="promo-card-content">
                  <h3>{card.title}</h3>
                  {card.description && (
                    <p>{card.description}</p>
                  )}
                </div>

                {(card.media || card.photo) && (
                  <div className="promo-card-action">
                    <span className="view-btn">
                      {card.media ? (card.media.type === 'video' ? 'Watch Video' : 'Listen Now') : 'View Image'}
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
      />
    </section>
  );
};

export default Cards;
