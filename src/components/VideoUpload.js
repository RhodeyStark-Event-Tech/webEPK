import { useRef, useCallback } from 'react';
import './VideoUpload.css';

const VideoUpload = ({ onVideoSelect }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'audio/mpeg', 'audio/wav'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video (MP4, MOV, WebM) or audio (MP3, WAV) file.');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size must be less than 100MB.');
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    onVideoSelect({
      type: isVideo ? 'video' : 'audio',
      src: blobUrl,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: `Uploaded ${isVideo ? 'video' : 'audio'} file`,
      isBlob: true
    });

    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onVideoSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="video-upload"
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
        accept="video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav"
        onChange={handleFileChange}
        className="video-upload-input"
        aria-hidden="true"
      />
      <div className="upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z"/>
        </svg>
      </div>
      <p className="upload-text">Click or drag to upload video/audio</p>
      <p className="upload-hint">MP4, MOV, WebM, MP3, WAV (max 100MB)</p>
    </div>
  );
};

export default VideoUpload;
