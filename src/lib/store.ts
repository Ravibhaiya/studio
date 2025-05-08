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
  addFlashcard: (deckId: string, cardData: Omit<Flashcard, 'id'>) => Flashcard | undefined;
  removeFlashcard: (deckId: string, flashcardId: string) => void;
  updateFlashcard: (deckId: string, flashcardId: string, updates: Partial<Omit<Flashcard, 'id'>>) => void;
  getFlashcard: (deckId: string, flashcardId: string) => Flashcard | undefined;
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
        const newFlashcard: Flashcard = {
          id: crypto.randomUUID(),
          ...cardData,
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
      }
    }),
    {
      name: 'flashy-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useFlashyStore;
