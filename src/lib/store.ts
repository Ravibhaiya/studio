"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Deck, Flashcard } from './types';

interface FlashyState {
  decks: Deck[];
  addDeck: (name: string, description?: string) => Deck;
  removeDeck: (deckId: string) => void;
  getDeck: (deckId: string) => Deck | undefined;
  updateDeck: (deckId: string, updates: Partial<Omit<Deck, 'id' | 'flashcards' | 'createdAt' | 'updatedAt'>>) => void;
  addFlashcard: (deckId: string, cardData: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval'>) => Flashcard | undefined;
  removeFlashcard: (deckId: string, flashcardId: string) => void;
  updateFlashcard: (deckId: string, flashcardId: string, updates: Partial<Omit<Flashcard, 'id'>>) => void;
  getFlashcard: (deckId: string, flashcardId: string) => Flashcard | undefined;
  giveFlashcardFeedback: (deckId: string, flashcardId: string, feedback: 'easy' | 'medium' | 'hard') => void;
}

const useFlashyStore = create<FlashyState>()(
  persist(
    (set, get) => ({
      decks: [],
      addDeck: (name, description) => {
        const newDeck: Deck = {
          id: crypto.randomUUID(),
          name,
          description: description || '',
          flashcards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          decks: [...state.decks, newDeck],
        }));
        return newDeck;
      },
      removeDeck: (deckId) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== deckId),
        }));
      },
      getDeck: (deckId) => {
        return get().decks.find((deck) => deck.id === deckId);
      },
      updateDeck: (deckId, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId ? { ...deck, ...updates, updatedAt: new Date().toISOString() } : deck
          ),
        }));
      },
      addFlashcard: (deckId, cardData) => {
        const now = new Date().toISOString();
        const newFlashcard: Flashcard = {
          id: crypto.randomUUID(),
          ...cardData,
          lastReviewed: undefined, // Or now if considered reviewed upon creation
          nextReview: now, // Due for review immediately
          easeFactor: 2.5, // Standard starting EF
          interval: 0, // Days, 0 means it's new or due
        };
        let SucceededFlashcard: Flashcard | undefined = undefined;
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              SucceededFlashcard = newFlashcard;
              return {
                ...deck,
                flashcards: [...deck.flashcards, newFlashcard],
                updatedAt: new Date().toISOString(),
              };
            }
            return deck;
          }),
        }));
        return SucceededFlashcard;
      },
      removeFlashcard: (deckId, flashcardId) => {
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              return {
                ...deck,
                flashcards: deck.flashcards.filter((fc) => fc.id !== flashcardId),
                updatedAt: new Date().toISOString(),
              };
            }
            return deck;
          }),
        }));
      },
      updateFlashcard: (deckId, flashcardId, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              return {
                ...deck,
                flashcards: deck.flashcards.map((fc) =>
                  fc.id === flashcardId ? { ...fc, ...updates } : fc
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return deck;
          }),
        }));
      },
      getFlashcard: (deckId, flashcardId) => {
        const deck = get().getDeck(deckId);
        return deck?.flashcards.find(fc => fc.id === flashcardId);
      },
      giveFlashcardFeedback: (deckId, flashcardId, feedback) => {
        set(state => {
          const decks = state.decks.map(deck => {
            if (deck.id === deckId) {
              const flashcards = deck.flashcards.map(card => {
                if (card.id === flashcardId) {
                  let currentEF = card.easeFactor ?? 2.5;
                  let currentInterval = card.interval ?? 0; // days

                  let newInterval: number;
                  let newEF = currentEF;

                  if (feedback === 'hard') {
                    newInterval = 1; // Reset to 1 day, review tomorrow
                    newEF = Math.max(1.3, currentEF - 0.20);
                  } else if (feedback === 'medium') {
                    if (currentInterval === 0) { // First time reviewing or failed previously
                      newInterval = 3; 
                    } else {
                      newInterval = Math.ceil(currentInterval * currentEF);
                    }
                    // newEF remains currentEF
                  } else { // easy
                    if (currentInterval === 0) { // First time reviewing or failed previously
                      newInterval = 5;
                    } else {
                      newInterval = Math.ceil(currentInterval * currentEF * 1.5); // Apply a boost for easy
                    }
                    newEF = currentEF + 0.15;
                  }

                  // Clamp EF to a minimum of 1.3
                  newEF = Math.max(1.3, newEF);
                  // Clamp interval to a reasonable max, e.g., 1 year (365 days)
                  newInterval = Math.min(Math.max(1, newInterval), 365);


                  const today = new Date();
                  const nextReviewDate = new Date(today);
                  nextReviewDate.setDate(today.getDate() + newInterval);
                  
                  return {
                    ...card,
                    lastReviewed: today.toISOString(),
                    nextReview: nextReviewDate.toISOString(),
                    easeFactor: newEF,
                    interval: newInterval,
                  };
                }
                return card;
              });
              return { ...deck, flashcards, updatedAt: new Date().toISOString() };
            }
            return deck;
          });
          return { decks };
        });
      }
    }),
    {
      name: 'flashy-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useFlashyStore;
