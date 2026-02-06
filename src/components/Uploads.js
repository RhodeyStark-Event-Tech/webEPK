import { useState, useCallback, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import { listFiles, deleteFile, formatFileSize } from '../firebase/storageService';
import './Uploads.css';

const Uploads = ({ isAuthenticated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [storedFiles, setStoredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch files from Firebase when authenticated
  const fetchFiles = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const files = await listFiles('media');
      setStoredFiles(files);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Check Firebase configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleVideoUpload = useCallback((media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  }, []);

  const handleUploadComplete = useCallback(() => {
    // Refresh file list after upload
    fetchFiles();
  }, [fetchFiles]);

  const handlePlayFile = (file) => {
    setSelectedMedia({
      type: file.type,
      src: file.url,
      title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
      description: `${file.type === 'video' ? 'Video' : 'Audio'} file`,
      fullPath: file.fullPath,
      isFirebase: true
    });
    setIsModalOpen(true);
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      await deleteFile(file.fullPath);
      setStoredFiles(prev => prev.filter(f => f.fullPath !== file.fullPath));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file.');
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          Upload your video or audio files to Firebase Storage
        </p>

        <VideoUpload
          onVideoSelect={handleVideoUpload}
          onUploadComplete={handleUploadComplete}
          useFirebase={true}
        />

        <div className="stored-files-section">
          <h3>Stored Files</h3>

          {isLoading && (
            <p className="loading-text">Loading files...</p>
          )}

          {error && (
            <p className="error-text">{error}</p>
          )}

          {!isLoading && !error && storedFiles.length === 0 && (
            <p className="no-files-text">No files uploaded yet.</p>
          )}

          {storedFiles.length > 0 && (
            <div className="files-grid">
              {storedFiles.map((file) => (
                <div key={file.fullPath} className="file-card">
                  <div className="file-icon">
                    {file.type === 'video' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    )}
                  </div>
                  <div className="file-info">
                    <p className="file-name" title={file.name}>
                      {file.name.replace(/^\d+_/, '')}
                    </p>
                    <p className="file-meta">
                      {formatFileSize(file.size)} • {formatDate(file.timeCreated)}
                    </p>
                  </div>
                  <div className="file-actions">
                    <button
                      className="play-btn"
                      onClick={() => handlePlayFile(file)}
                      aria-label={`Play ${file.name}`}
                    >
                      Play
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFile(file)}
                      aria-label={`Delete ${file.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default Uploads;
