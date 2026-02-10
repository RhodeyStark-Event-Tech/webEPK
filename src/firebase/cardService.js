import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const CARDS_COLLECTION = 'cards';

// Get all cards
export const getCards = async () => {
  try {
    const cardsRef = collection(db, CARDS_COLLECTION);
    const q = query(cardsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const cards = [];
    snapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      });
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
    const cardsRef = collection(db, CARDS_COLLECTION);
    // Generate a unique ID
    const newDocRef = doc(cardsRef);
    await setDoc(newDocRef, {
      ...cardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: newDocRef.id, ...cardData };
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
};

// Update an existing card
export const updateCard = async (cardId, cardData) => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await updateDoc(cardRef, {
      ...cardData,
      updatedAt: serverTimestamp()
    });
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
    await deleteDoc(cardRef);
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};
