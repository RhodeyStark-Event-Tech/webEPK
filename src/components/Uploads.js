import { useState, useCallback, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import { listFiles, deleteFile, formatFileSize } from '../firebase/storageService';
import {
  getPerformers,
  assignMediaToPerformer,
  assignPhotoToPerformer,
  removeMediaFromPerformer,
  removePhotoFromPerformer
} from '../firebase/performerService';
import './Uploads.css';

const Uploads = ({ isAuthenticated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [storedFiles, setStoredFiles] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState({});
  const [error, setError] = useState(null);

  // Fetch files and performers from Firebase when authenticated
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const [files, performerData] = await Promise.all([
        listFiles('media'),
        getPerformers()
      ]);
      setStoredFiles(files);
      setPerformers(performerData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Check Firebase configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle media assignment to performer
  const handleMediaAssign = async (performerId, fileFullPath) => {
    setIsSaving(prev => ({ ...prev, [`media-${performerId}`]: true }));

    try {
      if (!fileFullPath) {
        await removeMediaFromPerformer(performerId);
      } else {
        const file = storedFiles.find(f => f.fullPath === fileFullPath);
        if (file) {
          await assignMediaToPerformer(performerId, {
            type: file.type,
            src: file.url,
            title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
            description: `${file.type === 'video' ? 'Video' : 'Audio'} performance`,
            fullPath: file.fullPath
          });
        }
      }

      // Refresh performers
      const updatedPerformers = await getPerformers();
      setPerformers(updatedPerformers);
    } catch (err) {
      console.error('Error assigning media:', err);
      alert(`Failed to assign media: ${err.message}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [`media-${performerId}`]: false }));
    }
  };

  // Handle photo assignment to performer
  const handlePhotoAssign = async (performerId, fileFullPath) => {
    setIsSaving(prev => ({ ...prev, [`photo-${performerId}`]: true }));

    try {
      if (!fileFullPath) {
        await removePhotoFromPerformer(performerId);
      } else {
        const file = storedFiles.find(f => f.fullPath === fileFullPath);
        if (file) {
          await assignPhotoToPerformer(performerId, {
            src: file.url,
            title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
            fullPath: file.fullPath
          });
        }
      }

      // Refresh performers
      const updatedPerformers = await getPerformers();
      setPerformers(updatedPerformers);
    } catch (err) {
      console.error('Error assigning photo:', err);
      alert(`Failed to assign photo: ${err.message}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [`photo-${performerId}`]: false }));
    }
  };

  const handleVideoUpload = useCallback((media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  }, []);

  const handleUploadComplete = useCallback(() => {
    // Refresh file list after upload
    fetchData();
  }, [fetchData]);

  const handlePlayFile = (file) => {
    setSelectedMedia({
      type: file.type,
      src: file.url,
      title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
      description: `${file.type.charAt(0).toUpperCase() + file.type.slice(1)} file`,
      fullPath: file.fullPath,
      isFirebase: true
    });
    setIsModalOpen(true);
  };

  // Filter files by type for dropdowns
  const mediaFiles = storedFiles.filter(f => f.type === 'video' || f.type === 'audio');
  const imageFiles = storedFiles.filter(f => f.type === 'image');

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
                    ) : file.type === 'image' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
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
                      aria-label={`${file.type === 'image' ? 'View' : 'Play'} ${file.name}`}
                    >
                      {file.type === 'image' ? 'View' : 'Play'}
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

        {/* Performer Assignment Section */}
        <div className="performer-assignment-section">
          <h3>Assign Media to Performers</h3>
          <p className="assignment-intro">
            Select media files to display on each performer card in the EPK
          </p>

          {performers.length > 0 && (
            <div className="performer-assignment-grid">
              {performers.map((performer) => (
                <div key={performer.id} className="performer-assignment-card">
                  <div className="performer-assignment-header">
                    <div className="performer-avatar">
                      {performer.photo ? (
                        <img src={performer.photo.src} alt={performer.name} />
                      ) : (
                        <span>{performer.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="performer-details">
                      <h4>{performer.name}</h4>
                      <span className="performer-category-badge">{performer.category}</span>
                    </div>
                  </div>

                  <div className="assignment-controls">
                    <div className="assignment-field">
                      <label htmlFor={`photo-${performer.id}`}>Photo</label>
                      <select
                        id={`photo-${performer.id}`}
                        value={performer.photo?.fullPath || ''}
                        onChange={(e) => handlePhotoAssign(performer.id, e.target.value)}
                        disabled={isSaving[`photo-${performer.id}`] || imageFiles.length === 0}
                      >
                        <option value="">
                          {imageFiles.length === 0 ? 'No images uploaded' : 'Select a photo...'}
                        </option>
                        {imageFiles.map((file) => (
                          <option key={file.fullPath} value={file.fullPath}>
                            {file.name.replace(/^\d+_/, '')}
                          </option>
                        ))}
                      </select>
                      {isSaving[`photo-${performer.id}`] && (
                        <span className="saving-indicator">Saving...</span>
                      )}
                    </div>

                    <div className="assignment-field">
                      <label htmlFor={`media-${performer.id}`}>Video/Audio</label>
                      <select
                        id={`media-${performer.id}`}
                        value={performer.media?.fullPath || ''}
                        onChange={(e) => handleMediaAssign(performer.id, e.target.value)}
                        disabled={isSaving[`media-${performer.id}`] || mediaFiles.length === 0}
                      >
                        <option value="">
                          {mediaFiles.length === 0 ? 'No media uploaded' : 'Select media...'}
                        </option>
                        {mediaFiles.map((file) => (
                          <option key={file.fullPath} value={file.fullPath}>
                            {file.type === 'video' ? '🎬' : '🎵'} {file.name.replace(/^\d+_/, '')}
                          </option>
                        ))}
                      </select>
                      {isSaving[`media-${performer.id}`] && (
                        <span className="saving-indicator">Saving...</span>
                      )}
                    </div>
                  </div>

                  {performer.media && (
                    <div className="current-assignment">
                      <span className="assignment-label">Current media:</span>
                      <span className="assignment-value">{performer.media.title}</span>
                    </div>
                  )}
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
