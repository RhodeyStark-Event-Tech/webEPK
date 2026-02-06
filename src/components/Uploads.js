import { useState, useCallback, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import './Uploads.css';

const Uploads = ({ isAuthenticated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);

  const handleVideoUpload = useCallback((media) => {
    setUploadedMedia(media);
    setSelectedMedia(media);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    if (selectedMedia?.isBlob) {
      URL.revokeObjectURL(selectedMedia.src);
    }
    setSelectedMedia(null);
  }, [selectedMedia]);

  useEffect(() => {
    return () => {
      if (uploadedMedia?.isBlob) {
        URL.revokeObjectURL(uploadedMedia.src);
      }
    };
  }, [uploadedMedia]);

  return (
    <section
      id="uploads"
      className={`uploads-section ${isAuthenticated ? 'uploads-visible' : 'uploads-hidden'}`}
      role="region"
      aria-labelledby="uploads-heading"
    >
      <div className="uploads-container">
        <h2 id="uploads-heading">Upload Media</h2>
        <p className="uploads-intro">
          Upload your video or audio files to preview them in our media player
        </p>

        <VideoUpload onVideoSelect={handleVideoUpload} />

        {uploadedMedia && (
          <div className="uploaded-file-info">
            <p>Last uploaded: <strong>{uploadedMedia.title}</strong></p>
            <button
              className="replay-btn"
              onClick={() => {
                setSelectedMedia(uploadedMedia);
                setIsModalOpen(true);
              }}
            >
              Play Again
            </button>
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

export default Uploads;
