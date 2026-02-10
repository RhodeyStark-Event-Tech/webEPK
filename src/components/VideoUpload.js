import { useRef, useCallback, useState } from 'react';
import { uploadFile } from '../firebase/storageService';
import { useToast } from '../context/ToastContext';
import './VideoUpload.css';

const VideoUpload = ({ onVideoSelect, onUploadComplete, useFirebase = true }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validTypes = [
      'video/mp4', 'video/quicktime', 'video/webm',
      'audio/mpeg', 'audio/wav',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Please upload a valid video (MP4, MOV, WebM), audio (MP3, WAV), or image (JPG, PNG, GIF, WebP) file.';
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 100MB.';
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const fileType = isVideo ? 'video' : isImage ? 'image' : 'audio';

    if (useFirebase) {
      // Upload to Firebase Storage
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const uploadedFile = await uploadFile(file, 'media', (progress) => {
          setUploadProgress(progress);
        });

        const media = {
          type: fileType,
          src: uploadedFile.url,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded ${fileType} file`,
          fullPath: uploadedFile.fullPath,
          isFirebase: true
        };

        if (onVideoSelect) {
          onVideoSelect(media);
        }
        if (onUploadComplete) {
          onUploadComplete(uploadedFile);
        }
        toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`);
      } catch (err) {
        console.error('Upload failed:', err);
        const errorMsg = 'Upload failed. Please check your Firebase configuration.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Use local blob URL (fallback)
      const blobUrl = URL.createObjectURL(file);
      if (onVideoSelect) {
        onVideoSelect({
          type: fileType,
          src: blobUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded ${fileType} file`,
          isBlob: true
        });
      }
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onVideoSelect, onUploadComplete, useFirebase]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, [isUploading]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`video-upload ${isUploading ? 'uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload video or audio file"
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="video-upload-input"
        aria-hidden="true"
        disabled={isUploading}
      />

      {isUploading ? (
        <>
          <div className="upload-progress-container">
            <div
              className="upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <p className="upload-text">Uploading... {Math.round(uploadProgress)}%</p>
          <p className="upload-hint">Please wait while your file is being uploaded</p>
        </>
      ) : (
        <>
          <div className="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z"/>
            </svg>
          </div>
          <p className="upload-text">Click or drag to upload media</p>
          <p className="upload-hint">Video, Audio, or Images (max 100MB)</p>
          {useFirebase && (
            <p className="upload-hint firebase-hint">Files will be stored in Firebase</p>
          )}
        </>
      )}

      {error && (
        <p className="upload-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default VideoUpload;
