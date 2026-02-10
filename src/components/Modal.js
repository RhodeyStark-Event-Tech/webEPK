import { useEffect, useCallback } from 'react';
import { Media, Player, controls } from 'react-media-player';
import './Modal.css';

const { PlayPause, MuteUnmute, Progress, SeekBar, Duration, CurrentTime, Volume } = controls;

const Modal = ({ isOpen, onClose, media }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isVideo = media?.type === 'video';
  const isImage = media?.type === 'image';
  const isYouTube = media?.type === 'youtube';

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {media?.description && (
          <h1 className="modal-description">{media.description}</h1>
        )}

        {isYouTube ? (
          <div className="youtube-container">
            <iframe
              src={`https://www.youtube.com/embed/${media.videoId}?autoplay=0&rel=0`}
              title={media?.title || 'YouTube Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="youtube-iframe"
            />
          </div>
        ) : isImage ? (
          <div className="media-image-container">
            <img
              src={media?.src}
              alt={media?.title || 'Image'}
              className="media-image"
            />
          </div>
        ) : (
          <div className="media-player-container">
            <Media>
              <div className="media-player">
                <Player
                  src={media?.src ?? ''}
                  className={isVideo ? 'media-video' : 'media-audio'}
                  autoPlay={false}
                />
                <div className="media-controls">
                  <PlayPause className="media-control-btn" />
                  <CurrentTime className="media-time" />
                  <SeekBar className="media-seekbar" />
                  <Duration className="media-time" />
                  <MuteUnmute className="media-control-btn" />
                  <Volume className="media-volume" />
                </div>
              </div>
            </Media>
          </div>
        )}

        <div className="modal-actions">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScjkQJ-zXpR-GW-cXaXnpCyiX0vU_vemeCXL7g4weWQhfCKiA/viewform?usp=sharing&ouid=111455180566421488224"
            target="_blank"
            rel="noopener noreferrer"
            className="book-now-btn"
            aria-label="Book this performer - opens booking form in new tab"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Modal;
