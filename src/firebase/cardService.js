import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
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

// Get all cards
export const getCards = async () => {
  try {
    const cardsRef = collection(db, CARDS_COLLECTION);
    const snapshot = await getDocs(cardsRef);

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
    const newDocRef = doc(cardsRef);
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
    console.log('Document ID:', newDocRef.id);
    console.log('Collection path:', cardsRef.path);

    const startTime = Date.now();
    await withTimeout(setDoc(newDocRef, dataToSave));
    console.log(`Card saved successfully in ${Date.now() - startTime}ms with ID:`, newDocRef.id);

    return { id: newDocRef.id, ...cleanData };
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
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};
