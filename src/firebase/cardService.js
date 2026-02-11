import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  waitForPendingWrites
} from 'firebase/firestore';
import { db } from './config';

const CARDS_COLLECTION = 'cards';

// Timeout wrapper for Firestore operations
const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out. Please check your internet connection and Firebase configuration.')), timeoutMs)
    )
  ]);
};

// Ensure writes are synced to server
const ensureServerSync = async () => {
  try {
    await withTimeout(waitForPendingWrites(db), 10000);
    console.log('Data synced to server successfully');
  } catch (error) {
    console.warn('Server sync warning:', error.message);
    // Don't throw - the write may still succeed
  }
};

// Get all cards
export const getCards = async () => {
  try {
    console.log('Fetching cards from Firestore...');
    const cardsRef = collection(db, CARDS_COLLECTION);
    const snapshot = await withTimeout(getDocs(cardsRef));
    console.log('Fetched', snapshot.size, 'cards from Firestore');

    const cards = [];
    snapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt client-side
    cards.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0;
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0;
      return dateB - dateA;
    });

    return cards;
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
};

// Create a new card
export const createCard = async (cardData) => {
  try {
    console.log('Creating card with data:', cardData);
    const cardsRef = collection(db, CARDS_COLLECTION);
    const now = new Date().toISOString();

    // Clean the data - remove any undefined or empty values
    const cleanData = {};
    Object.keys(cardData).forEach(key => {
      if (cardData[key] !== undefined && cardData[key] !== '') {
        cleanData[key] = cardData[key];
      }
    });

    const dataToSave = {
      ...cleanData,
      createdAt: now,
      updatedAt: now
    };

    console.log('Saving to Firestore:', dataToSave);
    console.log('Collection path:', cardsRef.path);

    const startTime = Date.now();
    // Use addDoc instead of setDoc - it auto-generates the ID
    const docRef = await withTimeout(addDoc(cardsRef, dataToSave));
    console.log(`Card written in ${Date.now() - startTime}ms with ID:`, docRef.id);

    // Ensure the write is synced to the server
    await ensureServerSync();
    console.log(`Card synced to server. Total time: ${Date.now() - startTime}ms`);

    return { id: docRef.id, ...cleanData };
  } catch (error) {
    console.error('Error creating card:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Update an existing card
export const updateCard = async (cardId, cardData) => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await withTimeout(updateDoc(cardRef, {
      ...cardData,
      updatedAt: new Date().toISOString()
    }));
    await ensureServerSync();
    return { id: cardId, ...cardData };
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId) => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await withTimeout(deleteDoc(cardRef));
    await ensureServerSync();
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};
