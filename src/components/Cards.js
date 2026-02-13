import { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import OptimizedImage from './OptimizedImage';
import { getCards } from '../firebase/cardService';
import './Cards.css';

// Helper to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const Cards = ({ initialData }) => {
  const [cards, setCards] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaList, setSelectedMediaList] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

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
    // Skip fetching if initialData was provided
    if (initialData) {
      setCards(initialData);
      setIsLoading(false);
      return;
    }

    fetchCards();
  }, [initialData, fetchCards]);

  // Handle card click to view media
  const handleCardClick = (card) => {
    setModalTitle(card.title);

    // Check for new mediaList format (multiple media)
    if (card.mediaList && card.mediaList.length > 0) {
      setSelectedMediaList(card.mediaList);
      setSelectedMedia(null);
      setIsModalOpen(true);
      return;
    }

    // Legacy support: Check for YouTube URL
    if (card.youtubeUrl) {
      const videoId = getYouTubeVideoId(card.youtubeUrl);
      if (videoId) {
        setSelectedMedia({
          type: 'youtube',
          videoId: videoId,
          youtubeId: videoId,
          title: card.title
        });
        setSelectedMediaList(null);
        setIsModalOpen(true);
        return;
      }
    }

    // Legacy support: single media
    if (card.media) {
      setSelectedMedia({
        ...card.media,
        title: card.media.title || card.title
      });
      setSelectedMediaList(null);
      setIsModalOpen(true);
    } else if (card.photo) {
      setSelectedMedia({
        type: 'image',
        src: card.photo.src,
        title: card.photo.name || card.title
      });
      setSelectedMediaList(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    setSelectedMediaList(null);
    setModalTitle('');
  }, []);

  // Hide the entire section while loading or if there are no cards
  if (isLoading || (!error && cards.length === 0)) {
    return null;
  }

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

        {error && (
          <div className="cards-error">
            <p>{error}</p>
          </div>
        )}

        {cards.length > 0 && (
          <div className="cards-grid">
            {cards.map((card) => {
              const hasMediaList = card.mediaList && card.mediaList.length > 0;
              const hasMedia = hasMediaList || card.media || card.photo || card.youtubeUrl;
              const hasYouTube = card.youtubeUrl && getYouTubeVideoId(card.youtubeUrl);
              const mediaCount = card.mediaList?.length || 0;

              return (
                <article
                  key={card.id}
                  className={`promo-card ${hasMedia ? 'has-media' : ''}`}
                  onClick={() => handleCardClick(card)}
                  role={hasMedia ? 'button' : 'article'}
                  tabIndex={hasMedia ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (hasMedia && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleCardClick(card);
                    }
                  }}
                  aria-label={hasMedia ? `View ${card.title}` : card.title}
                >
                  <div className="promo-card-image">
                    {card.photo ? (
                      <OptimizedImage
                        src={card.photo.src}
                        alt={card.title}
                        className="light-theme"
                        placeholderColor="#e9ecef"
                        aspectRatio="4/3"
                      />
                    ) : hasYouTube ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(card.youtubeUrl)}/mqdefault.jpg`}
                        alt={card.title}
                        className="youtube-thumbnail"
                      />
                    ) : (
                      <div className="promo-card-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                    )}
                    {(hasMediaList || card.media || hasYouTube) && (
                      <div className="media-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        {mediaCount > 1 && (
                          <span className="media-count-badge">{mediaCount}</span>
                        )}
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

                  {hasMedia && (
                    <div className="promo-card-action">
                      <span className="view-btn">
                        {mediaCount > 1 ? `View Media (${mediaCount})` : hasYouTube || card.mediaList?.[0]?.type === 'youtube' || card.mediaList?.[0]?.type === 'video' || card.media?.type === 'video' ? 'Watch Video' : card.mediaList?.[0]?.type === 'audio' || card.media?.type === 'audio' ? 'Listen Now' : 'View'}
                      </span>
                    </div>
                  )}
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

export default Cards;
