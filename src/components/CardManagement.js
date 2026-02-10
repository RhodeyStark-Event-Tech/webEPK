import { useState, useCallback, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import Spinner from './Spinner';
import OptimizedImage from './OptimizedImage';
import { listFiles, formatFileSize } from '../firebase/storageService';
import { getCards, createCard, updateCard, deleteCard } from '../firebase/cardService';
import './CardManagement.css';

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

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [storedFiles, setStoredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photo: null,
    media: null,
    youtubeUrl: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Fetch cards and files from Firebase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [cardsData, files] = await Promise.all([
        getCards(),
        listFiles('media')
      ]);
      setCards(cardsData);
      setStoredFiles(files);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Check Firebase configuration.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter files by type
  const mediaFiles = storedFiles.filter(f => f.type === 'video' || f.type === 'audio');
  const imageFiles = storedFiles.filter(f => f.type === 'image');

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle photo selection from dropdown
  const handlePhotoSelect = (fileFullPath) => {
    if (!fileFullPath) {
      setFormData(prev => ({ ...prev, photo: null }));
      return;
    }
    const file = storedFiles.find(f => f.fullPath === fileFullPath);
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: {
          src: file.url,
          fullPath: file.fullPath,
          name: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '')
        }
      }));
    }
  };

  // Handle media selection from dropdown
  const handleMediaSelect = (fileFullPath) => {
    if (!fileFullPath) {
      setFormData(prev => ({ ...prev, media: null }));
      return;
    }
    const file = storedFiles.find(f => f.fullPath === fileFullPath);
    if (file) {
      setFormData(prev => ({
        ...prev,
        media: {
          type: file.type,
          src: file.url,
          fullPath: file.fullPath,
          title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
          description: `${file.type === 'video' ? 'Video' : 'Audio'} content`
        },
        youtubeUrl: '' // Clear YouTube URL when selecting uploaded media
      }));
    }
  };

  // Handle YouTube URL input
  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      youtubeUrl: url,
      media: url ? null : prev.media // Clear uploaded media when entering YouTube URL
    }));
  };

  // Handle new upload completion
  const handleUploadComplete = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      photo: null,
      media: null,
      youtubeUrl: ''
    });
    setIsEditing(false);
    setEditingCardId(null);
    setShowForm(false);
  };

  // Open form for creating new card
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing existing card
  const handleEdit = (card) => {
    setFormData({
      title: card.title || '',
      description: card.description || '',
      category: card.category || '',
      photo: card.photo || null,
      media: card.media || null,
      youtubeUrl: card.youtubeUrl || ''
    });
    setIsEditing(true);
    setEditingCardId(card.id);
    setShowForm(true);
  };

  // Save card (create or update)
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a card title.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && editingCardId) {
        await updateCard(editingCardId, formData);
      } else {
        await createCard(formData);
      }
      await fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving card:', err);
      alert(`Failed to save card: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete card
  const handleDelete = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCard(cardId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting card:', err);
      alert(`Failed to delete card: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Preview media
  const handlePreviewMedia = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  // Preview photo as media
  const handlePreviewPhoto = (photo) => {
    setSelectedMedia({
      type: 'image',
      src: photo.src,
      title: photo.name || 'Card Image'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section
      id="card-management"
      className="card-management-section"
      role="region"
      aria-labelledby="card-management-heading"
    >
      <div className="card-management-container">
        <h2 id="card-management-heading">Card Management</h2>
        <p className="card-management-intro">
          Create and manage promotional cards displayed to general admin users
        </p>

        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload New Media</h3>
          <p className="section-hint">Upload photos, videos, or audio to use in your cards</p>
          <VideoUpload
            onUploadComplete={handleUploadComplete}
            useFirebase={true}
          />
        </div>

        {/* Card Form */}
        {showForm && (
          <div className="card-form-section">
            <h3>{isEditing ? 'Edit Card' : 'Create New Card'}</h3>

            <div className="card-form">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="card-title">Title *</label>
                  <input
                    id="card-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter card title"
                    disabled={isSaving}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="card-category">Category</label>
                  <input
                    id="card-category"
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Promotion, Announcement"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="card-description">Description</label>
                <textarea
                  id="card-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter card description"
                  rows={4}
                  disabled={isSaving}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="card-photo">Photo</label>
                  <select
                    id="card-photo"
                    value={formData.photo?.fullPath || ''}
                    onChange={(e) => handlePhotoSelect(e.target.value)}
                    disabled={isSaving || imageFiles.length === 0}
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
                  {formData.photo && (
                    <div className="selected-preview">
                      <img src={formData.photo.src} alt="Selected" />
                      <button
                        type="button"
                        className="preview-btn"
                        onClick={() => handlePreviewPhoto(formData.photo)}
                      >
                        Preview
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="card-media">Audio (from uploads)</label>
                  <select
                    id="card-media"
                    value={formData.media?.fullPath || ''}
                    onChange={(e) => handleMediaSelect(e.target.value)}
                    disabled={isSaving || mediaFiles.length === 0 || formData.youtubeUrl}
                  >
                    <option value="">
                      {formData.youtubeUrl ? 'Using YouTube URL' : mediaFiles.length === 0 ? 'No media uploaded' : 'Select audio...'}
                    </option>
                    {mediaFiles.filter(f => f.type === 'audio').map((file) => (
                      <option key={file.fullPath} value={file.fullPath}>
                        🎵 {file.name.replace(/^\d+_/, '')}
                      </option>
                    ))}
                  </select>
                  {formData.media && (
                    <div className="selected-media-info">
                      <span className="media-type-badge">
                        {formData.media.type === 'video' ? '🎬 Video' : '🎵 Audio'}
                      </span>
                      <span className="media-title">{formData.media.title}</span>
                      <button
                        type="button"
                        className="preview-btn"
                        onClick={() => handlePreviewMedia(formData.media)}
                      >
                        Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field youtube-field">
                <label htmlFor="card-youtube">YouTube Video URL</label>
                <input
                  id="card-youtube"
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleYouTubeUrlChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isSaving}
                />
                {formData.youtubeUrl && getYouTubeVideoId(formData.youtubeUrl) && (
                  <div className="youtube-preview">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeVideoId(formData.youtubeUrl)}/mqdefault.jpg`}
                      alt="YouTube thumbnail"
                    />
                    <span className="media-type-badge">YouTube Video</span>
                  </div>
                )}
                {formData.youtubeUrl && !getYouTubeVideoId(formData.youtubeUrl) && (
                  <p className="field-error">Invalid YouTube URL</p>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create New Button */}
        {!showForm && (
          <div className="create-card-section">
            <button
              className="create-card-btn"
              onClick={handleCreateNew}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create New Card
            </button>
          </div>
        )}

        {/* Existing Cards List */}
        <div className="existing-cards-section">
          <h3>Existing Cards</h3>

          {isLoading && (
            <div className="loading-container">
              <Spinner size="medium" text="Loading cards..." />
            </div>
          )}

          {error && (
            <p className="error-text">{error}</p>
          )}

          {!isLoading && !error && cards.length === 0 && (
            <p className="no-cards-text">No cards created yet. Click "Create New Card" to get started.</p>
          )}

          {cards.length > 0 && (
            <div className="cards-management-grid">
              {cards.map((card) => (
                <div key={card.id} className="card-management-item">
                  <div className="card-thumbnail">
                    {card.photo ? (
                      <OptimizedImage
                        src={card.photo.src}
                        alt={card.title}
                        aspectRatio="16/10"
                      />
                    ) : (
                      <div className="card-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                    )}
                    {card.media && (
                      <span className="media-indicator">
                        {card.media.type === 'video' ? '🎬' : '🎵'}
                      </span>
                    )}
                  </div>

                  <div className="card-item-content">
                    <h4>{card.title}</h4>
                    {card.category && (
                      <span className="card-category-badge">{card.category}</span>
                    )}
                    {card.description && (
                      <p className="card-description-preview">{card.description}</p>
                    )}
                    <p className="card-meta">Created: {formatDate(card.createdAt)}</p>
                  </div>

                  <div className="card-item-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(card)}
                      aria-label={`Edit ${card.title}`}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(card.id)}
                      aria-label={`Delete ${card.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stored Files Reference */}
        <div className="stored-files-reference">
          <h3>Available Media Files</h3>
          <p className="section-hint">These files can be assigned to cards</p>

          {isLoading ? (
            <div className="loading-container">
              <Spinner size="small" text="Loading files..." />
            </div>
          ) : storedFiles.length === 0 ? (
            <p className="no-files-text">No files uploaded yet.</p>
          ) : (
            <div className="files-list">
              {storedFiles.map((file) => (
                <div key={file.fullPath} className="file-item">
                  <span className="file-type-icon">
                    {file.type === 'video' ? '🎬' : file.type === 'audio' ? '🎵' : '🖼️'}
                  </span>
                  <span className="file-name-text">{file.name.replace(/^\d+_/, '')}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
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

      {/* Saving/Deleting Overlay */}
      {(isSaving || isDeleting) && (
        <div className="spinner-overlay">
          <Spinner
            size="large"
            color="white"
            text={isSaving ? 'Saving card...' : 'Deleting card...'}
          />
        </div>
      )}
    </section>
  );
};

export default CardManagement;
