import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata
} from 'firebase/storage';
import { storage } from './config';

// Upload file to Firebase Storage with progress tracking
export const uploadFile = (file, folder = 'media', onProgress) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const metadata = await getMetadata(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            name: file.name,
            fullPath: uploadTask.snapshot.ref.fullPath,
            type: file.type,
            size: file.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Get all files from a folder
export const listFiles = async (folder = 'media') => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        return {
          url,
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          contentType: metadata.contentType,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          type: metadata.contentType?.startsWith('video/') ? 'video' :
                metadata.contentType?.startsWith('audio/') ? 'audio' :
                metadata.contentType?.startsWith('image/') ? 'image' : 'other'
        };
      })
    );

    // Sort by creation time (newest first)
    return files.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Delete a file from storage
export const deleteFile = async (fullPath) => {
  try {
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file download URL
export const getFileURL = async (fullPath) => {
  try {
    const fileRef = ref(storage, fullPath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
