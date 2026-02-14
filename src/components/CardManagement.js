import { useState, useCallback, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import Spinner from './Spinner';
import OptimizedImage from './OptimizedImage';
import { useToast } from '../context/ToastContext';
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
  const toast = useToast();
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
    testimonial: '',
    category: '',
    photo: null,
    mediaList: [], // Array of media items
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
      toast.error('Failed to load data. Check Firebase configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

  // Handle adding media to the list
  const handleAddMedia = (fileFullPath) => {
    if (!fileFullPath) return;

    const file = storedFiles.find(f => f.fullPath === fileFullPath);
    if (file) {
      // Check if already added
      if (formData.mediaList.some(m => m.fullPath === file.fullPath)) {
        toast.warning('This media is already added to the card.');
        return;
      }

      const newMedia = {
        type: file.type,
        src: file.url,
        fullPath: file.fullPath,
        title: file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
        thumbnail: file.type === 'image' ? file.url : null
      };

      setFormData(prev => ({
        ...prev,
        mediaList: [...prev.mediaList, newMedia]
      }));
    }
  };

  // Handle removing media from the list
  const handleRemoveMedia = (fullPath) => {
    setFormData(prev => ({
      ...prev,
      mediaList: prev.mediaList.filter(m => m.fullPath !== fullPath)
    }));
  };

  // Handle setting thumbnail for a media item
  const handleSetThumbnail = (mediaFullPath, thumbnailFullPath) => {
    const thumbnailFile = storedFiles.find(f => f.fullPath === thumbnailFullPath);
    if (thumbnailFile) {
      setFormData(prev => ({
        ...prev,
        mediaList: prev.mediaList.map(m =>
          m.fullPath === mediaFullPath
            ? { ...m, thumbnail: thumbnailFile.url }
            : m
        )
      }));
    }
  };

  // Handle YouTube URL input
  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      youtubeUrl: url
    }));
  };

  // Add YouTube video to media list
  const handleAddYouTube = () => {
    const videoId = getYouTubeVideoId(formData.youtubeUrl);
    if (!videoId) {
      toast.warning('Please enter a valid YouTube URL.');
      return;
    }

    // Check if already added
    if (formData.mediaList.some(m => m.youtubeId === videoId)) {
      toast.warning('This YouTube video is already added.');
      return;
    }

    const newMedia = {
      type: 'youtube',
      youtubeId: videoId,
      src: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      title: 'YouTube Video',
      fullPath: `youtube-${videoId}`
    };

    setFormData(prev => ({
      ...prev,
      mediaList: [...prev.mediaList, newMedia],
      youtubeUrl: ''
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
      testimonial: '',
      category: '',
      photo: null,
      mediaList: [],
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
    // Convert legacy single media to array format
    let mediaList = card.mediaList || [];
    if (!mediaList.length && card.media) {
      mediaList = [card.media];
    }
    if (!mediaList.length && card.youtubeUrl) {
      const videoId = getYouTubeVideoId(card.youtubeUrl);
      if (videoId) {
        mediaList = [{
          type: 'youtube',
          youtubeId: videoId,
          src: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          title: 'YouTube Video',
          fullPath: `youtube-${videoId}`
        }];
      }
    }

    setFormData({
      title: card.title || '',
      description: card.description || '',
      testimonial: card.testimonial || '',
      category: card.category || '',
      photo: card.photo || null,
      mediaList: mediaList,
      youtubeUrl: ''
    });
    setIsEditing(true);
    setEditingCardId(card.id);
    setShowForm(true);
  };

  // Save card (create or update)
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.warning('Please enter a card title.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && editingCardId) {
        await updateCard(editingCardId, formData);
        toast.success('Card updated successfully!');
      } else {
        await createCard(formData);
        toast.success('Card created successfully!');
      }
      await fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving card:', err);
      toast.error(`Failed to save card: ${err.message}`);
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
      toast.success('Card deleted successfully!');
    } catch (err) {
      console.error('Error deleting card:', err);
      toast.error(`Failed to delete card: ${err.message}`);
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

              <div className="form-field">
                <label htmlFor="card-testimonial">Testimonial</label>
                <textarea
                  id="card-testimonial"
                  name="testimonial"
                  value={formData.testimonial}
                  onChange={handleInputChange}
                  placeholder="Enter a testimonial quote (optional)"
                  rows={3}
                  disabled={isSaving}
                />
                <p className="field-hint">This will appear as a quote below the description in the modal</p>
              </div>

              <div className="form-field">
                <label htmlFor="card-photo">Card Cover Photo</label>
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

              {/* Media List Section */}
              <div className="form-field media-list-section">
                <label>Media Items ({formData.mediaList.length})</label>
                <p className="section-hint">Add videos or audio files to this card</p>

                {/* Current media list */}
                {formData.mediaList.length > 0 && (
                  <div className="media-list-items">
                    {formData.mediaList.map((media, index) => (
                      <div key={media.fullPath} className="media-list-item">
                        <div className="media-item-thumbnail">
                          {media.thumbnail ? (
                            <img src={media.thumbnail} alt={media.title} />
                          ) : media.type === 'youtube' ? (
                            <img src={`https://img.youtube.com/vi/${media.youtubeId}/mqdefault.jpg`} alt={media.title} />
                          ) : (
                            <div className="media-placeholder">
                              {media.type === 'video' ? '🎬' : '🎵'}
                            </div>
                          )}
                        </div>
                        <div className="media-item-info">
                          <span className="media-item-title">{media.title}</span>
                          <span className="media-type-badge">
                            {media.type === 'youtube' ? 'YouTube' : media.type === 'video' ? 'Video' : 'Audio'}
                          </span>
                        </div>
                        {media.type !== 'youtube' && media.type !== 'image' && (
                          <select
                            className="thumbnail-select"
                            value={media.thumbnail || ''}
                            onChange={(e) => handleSetThumbnail(media.fullPath, e.target.value)}
                          >
                            <option value="">Select thumbnail...</option>
                            {imageFiles.map((file) => (
                              <option key={file.fullPath} value={file.fullPath}>
                                {file.name.replace(/^\d+_/, '')}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          className="remove-media-btn"
                          onClick={() => handleRemoveMedia(media.fullPath)}
                          aria-label="Remove media"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add from uploads */}
                <div className="add-media-row">
                  <select
                    id="add-media"
                    onChange={(e) => {
                      handleAddMedia(e.target.value);
                      e.target.value = '';
                    }}
                    disabled={isSaving || mediaFiles.length === 0}
                  >
                    <option value="">Add from uploads...</option>
                    {mediaFiles.map((file) => (
                      <option key={file.fullPath} value={file.fullPath}>
                        {file.type === 'video' ? '🎬' : '🎵'} {file.name.replace(/^\d+_/, '')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add YouTube */}
                <div className="add-youtube-row">
                  <input
                    id="card-youtube"
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleYouTubeUrlChange}
                    placeholder="Paste YouTube URL and click Add..."
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    className="add-youtube-btn"
                    onClick={handleAddYouTube}
                    disabled={isSaving || !formData.youtubeUrl}
                  >
                    Add YouTube
                  </button>
                </div>
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
                    {(card.mediaList?.length > 0 || card.media) && (
                      <span className="media-indicator">
                        {card.mediaList?.length > 1 ? `📁 ${card.mediaList.length}` : card.mediaList?.[0]?.type === 'video' || card.mediaList?.[0]?.type === 'youtube' ? '🎬' : card.media?.type === 'video' ? '🎬' : '🎵'}
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
