import { useState, useEffect, useCallback, useRef } from 'react';
import './Modal.css';

// Component to generate thumbnail from video URL
const VideoThumbnail = ({ src, alt }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'ready', 'error'
  const videoRef = useRef(null);

  useEffect(() => {
    // Create a video element to generate thumbnail
    const video = document.createElement('video');
    videoRef.current = video;

    video.muted = true;
    video.preload = 'metadata';
    video.playsInline = true;

    // Try with crossOrigin first for canvas access
    let triedWithoutCors = false;

    const attemptThumbnail = () => {
      const canvas = document.createElement('canvas');
      try {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        // Check if canvas was tainted
        if (dataUrl && dataUrl !== 'data:,') {
          setThumbnail(dataUrl);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (err) {
        // Canvas tainted or other error
        setStatus('error');
      }
    };

    const handleLoadedData = () => {
      // Seek to 1 second or 10% of duration, whichever is smaller
      const seekTime = Math.min(1, video.duration * 0.1 || 0.5);
      video.currentTime = seekTime;
    };

    const handleSeeked = () => {
      attemptThumbnail();
    };

    const handleError = () => {
      if (!triedWithoutCors && video.crossOrigin) {
        // Retry without crossOrigin - video will load but canvas will be tainted
        triedWithoutCors = true;
        video.crossOrigin = null;
        video.src = src;
      } else {
        setStatus('error');
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    // Start with crossOrigin for clean canvas access
    video.crossOrigin = 'anonymous';
    video.src = src;

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.pause();
      video.src = '';
      videoRef.current = null;
    };
  }, [src]);

  if (status === 'loading') {
    return (
      <div className="thumbnail-loading">
        <div className="thumbnail-spinner"></div>
      </div>
    );
  }

  if (status === 'ready' && thumbnail) {
    return <img src={thumbnail} alt={alt} className="video-thumbnail-img" />;
  }

  // Fallback: show styled placeholder with video icon and title initial
  const initial = alt ? alt.charAt(0).toUpperCase() : 'V';
  return (
    <div className="gallery-placeholder video-placeholder">
      <span className="placeholder-icon">▶</span>
      <span className="placeholder-initial">{initial}</span>
    </div>
  );
};

const Modal = ({ isOpen, onClose, media, mediaList, title, description, testimonial }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset selected item when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (selectedItem && mediaList?.length > 1) {
        setSelectedItem(null);
      } else {
        onClose();
      }
    }
  }, [onClose, selectedItem, mediaList]);

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

  // Determine if we have multiple media items
  const hasMultipleMedia = mediaList && mediaList.length > 1;
  const hasSingleMedia = mediaList && mediaList.length === 1;

  // Current item to display (either selected from list or single media/legacy media)
  const currentItem = selectedItem || (hasSingleMedia ? mediaList[0] : media);

  // Show gallery view if multiple items and none selected
  const showGallery = hasMultipleMedia && !selectedItem;

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  const renderMediaItem = (item) => {
    if (!item) return null;

    const isVideo = item.type === 'video';
    const isImage = item.type === 'image';
    const isYouTube = item.type === 'youtube';
    const isAudio = item.type === 'audio';

    if (isYouTube) {
      return (
        <div className="youtube-container">
          <iframe
            src={`https://www.youtube.com/embed/${item.youtubeId || item.videoId}?autoplay=0&rel=0`}
            title={item.title || 'YouTube Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="youtube-iframe"
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="media-image-container">
          <img src={item.src} alt={item.title || 'Image'} className="media-image" />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="media-player-container">
          <video
            src={item.src}
            className="media-video"
            controls
            controlsList="nodownload"
            playsInline
          >
            Your browser does not support the video element.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="media-player-container audio-player">
          <div className="audio-thumbnail">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title} />
            ) : (
              <div className="audio-icon">🎵</div>
            )}
          </div>
          <audio
            src={item.src}
            className="media-audio"
            controls
            controlsList="nodownload"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content ${showGallery ? 'gallery-mode' : ''}`}>
        {/* Close/Back Button */}
        <button
          className="modal-close"
          onClick={selectedItem && hasMultipleMedia ? handleBack : onClose}
          aria-label={selectedItem && hasMultipleMedia ? 'Back to gallery' : 'Close modal'}
        >
          {selectedItem && hasMultipleMedia ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          ) : (
            <span>&times;</span>
          )}
        </button>

        {/* Title */}
        {(title || currentItem?.title) && !showGallery && (
          <h1 className="modal-title">{selectedItem?.title || title}</h1>
        )}

        {title && showGallery && (
          <h1 className="modal-title">{title}</h1>
        )}

        {/* Description - show media-specific description in single view */}
        {selectedItem?.description ? (
          <p className="modal-description">
            {selectedItem.description.split('\n').map((line, i) => (
              <span key={i}>{line}{i < selectedItem.description.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        ) : description && (
          <p className="modal-description">{description}</p>
        )}

        {/* Price - show when viewing individual media */}
        {selectedItem?.price && (
          <p className="modal-price">{selectedItem.price}</p>
        )}

        {/* Testimonial - only show in gallery/main view, not single media view */}
        {!selectedItem && testimonial && (() => {
          // Split testimonial into quote and attribution (looks for " -" pattern)
          const dashIndex = testimonial.lastIndexOf(' -');
          if (dashIndex > 0) {
            const quote = testimonial.substring(0, dashIndex);
            const attribution = testimonial.substring(dashIndex + 1); // keeps the dash
            return (
              <blockquote className="modal-testimonial">
                <p>"{quote}"</p>
                <cite className="testimonial-attribution">{attribution}</cite>
              </blockquote>
            );
          }
          return (
            <blockquote className="modal-testimonial">
              <p>"{testimonial}"</p>
            </blockquote>
          );
        })()}

        {/* Gallery View */}
        {showGallery && (
          <div className="media-gallery">
            <p className="gallery-hint">Select media to view</p>
            <div className="gallery-grid">
              {mediaList.map((item, index) => (
                <button
                  key={item.fullPath || index}
                  className="gallery-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="gallery-thumbnail">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} />
                    ) : item.type === 'youtube' ? (
                      <img
                        src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                        alt={item.title}
                      />
                    ) : item.type === 'video' && item.src ? (
                      <VideoThumbnail src={item.src} alt={item.title} />
                    ) : (
                      <div className="gallery-placeholder">
                        {item.type === 'video' ? '🎬' : '🎵'}
                      </div>
                    )}
                    <div className="gallery-play-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <span className="gallery-item-title">{item.title}</span>
                  <span className="gallery-item-type">
                    {item.type === 'youtube' ? 'YouTube' : item.type === 'video' ? 'Video' : 'Audio'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single Media View */}
        {!showGallery && renderMediaItem(currentItem)}

        {/* Book Now Button */}
        {!showGallery && (
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
        )}
      </div>
    </div>
  );
};

export default Modal;
