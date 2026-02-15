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
    description: 'Versatile cover band specializing in rock, pop, and jazz classics.',
    testimonial: 'The event was incredible and you guys blew us away! -Claire Walden MN Vikings Events',
    photo: {
      src: 'https://firebasestorage.googleapis.com/v0/b/rs-epk.firebasestorage.app/o/media%2F2K0A2774_1.jpg?alt=media&token=9c8c88cc-4771-4251-9fff-e2c768b66424',
      name: 'The Sessions'
    },
    mediaList: [
      {
        type: 'video',
        src: 'https://firebasestorage.googleapis.com/v0/b/rs-epk.firebasestorage.app/o/media%2Fsessions%20mp4.mp4?alt=media&token=cff8da5c-288b-4f64-a7b5-cdf1e96e103b',
        title: 'The Sessions 5pc',
        description: 'DJ/DRUMS/SAX/ 2 VOCALISTS (Backline Gear included)\nCombining the energy of live instrumentation with the endless playlists and genre bending of a DJ The Sessions are a band that can cater to audiences of all ages and walks of life. The Sessions 5 piece is lean and mean with 2 phenomenal vocalists helming the ship. Sessions play for up to 5 hours of music.',
        price: '$5,500'
      },
      {
        type: 'video',
        src: 'https://firebasestorage.googleapis.com/v0/b/rs-epk.firebasestorage.app/o/media%2FSessions4PC.mp4?alt=media&token=a91b3c3c-fd57-4ecc-a074-7d1a722c0212',
        title: 'Sessions 4pc',
        description: 'DJ/DRUMS/KEYS/SAX (Backline Gear included)\nCombining the energy of live instrumentation with the endless playlists and genre bending of a DJ The Sessions are a band that can cater to audiences of all ages and walks of life. The Sessions play for up to 5 hours of continuous music with one goal in mind. Creating memorable moments on the dance floor and beyond.',
        price: '$5,000'
      },
      {
        type: 'video',
        src: 'https://firebasestorage.googleapis.com/v0/b/rs-epk.firebasestorage.app/o/media%2FSessions10pc.mp4?alt=media&token=d820a08e-cdf5-4236-98c8-6bc793122e51',
        title: 'The Sessions 10pc',
        description: 'DJ/DRUMS/KEYS/SAX/TROMBONE/TRUMPET/BASS/GUITAR/4 VOCALISTS\nThis is a big band with a huge sound that can fill an arena or make your party the ultimate live experience.',
        price: '$10,000'
      }
    ]
  },
  {
    id: 2,
    name: 'NOSTALGIA',
    category: 'Live Music',
    description: 'The finest vocalists and instrumentalists playing the greatest hits of all time. Guaranteed to get everyone on the dance floor.',
    testimonial: ''
  },
  {
    id: 3,
    name: 'Dynamic Duo DJs',
    category: 'DJ Services',
    description: 'High-energy DJ team keeping the dance floor packed all night long.',
    testimonial: ''
  },
  {
    id: 4,
    name: 'Spark Entertainment',
    category: 'Fire Performance',
    description: 'Mesmerizing fire dancers and LED performers for spectacular shows.',
    testimonial: ''
  },
  {
    id: 5,
    name: 'Comedy Kings',
    category: 'Stand-up Comedy',
    description: 'Professional comedians delivering clean, crowd-pleasing humor.',
    testimonial: ''
  },
  {
    id: 6,
    name: 'String Quartet Elegance',
    category: 'Classical Music',
    description: 'Sophisticated classical ensemble perfect for formal occasions.',
    testimonial: ''
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

    // Merge with default performers (Firestore data overrides defaults)
    return defaultPerformers.map((performer) => {
      const stored = storedPerformers[String(performer.id)];
      return {
        ...performer,
        media: stored?.media || performer.media || null,
        mediaList: stored?.mediaList || performer.mediaList || null,
        photo: stored?.photo || performer.photo || null,
        testimonial: stored?.testimonial || performer.testimonial || ''
      };
    });
  } catch (error) {
    console.error('Error getting performers:', error);
    // Return defaults if Firestore fails (preserving any hardcoded media/photo)
    return defaultPerformers.map(p => ({ ...p, media: p.media || null, mediaList: p.mediaList || null, photo: p.photo || null, testimonial: p.testimonial || '' }));
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
    await setDoc(performerRef, { media }, { merge: true });
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
    await setDoc(performerRef, { photo }, { merge: true });
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
    await setDoc(performerRef, { media: null }, { merge: true });
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
    await setDoc(performerRef, { photo: null }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error removing photo:', error);
    throw error;
  }
};
