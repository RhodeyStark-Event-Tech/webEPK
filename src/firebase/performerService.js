import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';

const PERFORMERS_COLLECTION = 'performers';

// Default performers data
export const defaultPerformers = [
  {
    id: 1,
    name: 'The Sessions',
    category: 'Live Music',
    description: 'Versatile cover band specializing in rock, pop, and jazz classics.'
  },
  {
    id: 2,
    name: 'NOSTALGIA',
    category: 'Live Music',
    description: 'The finest vocalists and instrumentalists playing the greatest hits of all time. Guaranteed to get everyone on the dance floor.'
  },
  {
    id: 3,
    name: 'Dynamic Duo DJs',
    category: 'DJ Services',
    description: 'High-energy DJ team keeping the dance floor packed all night long.'
  },
  {
    id: 4,
    name: 'Spark Entertainment',
    category: 'Fire Performance',
    description: 'Mesmerizing fire dancers and LED performers for spectacular shows.'
  },
  {
    id: 5,
    name: 'Comedy Kings',
    category: 'Stand-up Comedy',
    description: 'Professional comedians delivering clean, crowd-pleasing humor.'
  },
  {
    id: 6,
    name: 'String Quartet Elegance',
    category: 'Classical Music',
    description: 'Sophisticated classical ensemble perfect for formal occasions.'
  }
];

// Get all performers with their assigned media
export const getPerformers = async () => {
  try {
    const performersRef = collection(db, PERFORMERS_COLLECTION);
    const snapshot = await getDocs(performersRef);

    // Create a map of stored performers by ID
    const storedPerformers = {};
    snapshot.forEach((doc) => {
      storedPerformers[doc.id] = doc.data();
    });

    // Merge with default performers
    return defaultPerformers.map((performer) => {
      const stored = storedPerformers[String(performer.id)];
      return {
        ...performer,
        media: stored?.media || null,
        photo: stored?.photo || null
      };
    });
  } catch (error) {
    console.error('Error getting performers:', error);
    // Return defaults if Firestore fails
    return defaultPerformers.map(p => ({ ...p, media: null, photo: null }));
  }
};

// Get a single performer
export const getPerformer = async (performerId) => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, String(performerId));
    const snapshot = await getDoc(performerRef);

    const defaultPerformer = defaultPerformers.find(p => p.id === performerId);
    if (!defaultPerformer) return null;

    if (snapshot.exists()) {
      return {
        ...defaultPerformer,
        ...snapshot.data()
      };
    }

    return { ...defaultPerformer, media: null, photo: null };
  } catch (error) {
    console.error('Error getting performer:', error);
    return null;
  }
};

// Assign media to a performer
export const assignMediaToPerformer = async (performerId, media) => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, String(performerId));
    const snapshot = await getDoc(performerRef);

    if (snapshot.exists()) {
      await updateDoc(performerRef, { media });
    } else {
      await setDoc(performerRef, { media });
    }

    return true;
  } catch (error) {
    console.error('Error assigning media:', error);
    throw error;
  }
};

// Assign photo to a performer
export const assignPhotoToPerformer = async (performerId, photo) => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, String(performerId));
    const snapshot = await getDoc(performerRef);

    if (snapshot.exists()) {
      await updateDoc(performerRef, { photo });
    } else {
      await setDoc(performerRef, { photo });
    }

    return true;
  } catch (error) {
    console.error('Error assigning photo:', error);
    throw error;
  }
};

// Remove media assignment from a performer
export const removeMediaFromPerformer = async (performerId) => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, String(performerId));
    const snapshot = await getDoc(performerRef);

    if (snapshot.exists()) {
      await updateDoc(performerRef, { media: null });
    }

    return true;
  } catch (error) {
    console.error('Error removing media:', error);
    throw error;
  }
};

// Remove photo assignment from a performer
export const removePhotoFromPerformer = async (performerId) => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, String(performerId));
    const snapshot = await getDoc(performerRef);

    if (snapshot.exists()) {
      await updateDoc(performerRef, { photo: null });
    }

    return true;
  } catch (error) {
    console.error('Error removing photo:', error);
    throw error;
  }
};
