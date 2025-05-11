"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Deck, Flashcard, Quiz, QuizQuestion, QuizQuestionOption, QuizAttempt, UserAnswerInAttempt } from './types';

interface FlashyState {
  decks: Deck[];
  addDeck: (name: string) => Deck;
  removeDeck: (deckId: string) => void;
  getDeck: (deckId: string) => Deck | undefined;
  updateDeck: (deckId: string, updates: Partial<Omit<Deck, 'id' | 'flashcards' | 'createdAt' | 'updatedAt'>>) => void;
  addFlashcard: (deckId: string, cardData: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval'>) => Flashcard | undefined;
  removeFlashcard: (deckId: string, flashcardId: string) => void;
  updateFlashcard: (deckId: string, flashcardId: string, updates: Partial<Omit<Flashcard, 'id'>>) => void;
  getFlashcard: (deckId: string, flashcardId: string) => Flashcard | undefined;
  giveFlashcardFeedback: (deckId: string, flashcardId: string, feedback: 'easy' | 'medium' | 'hard') => void;

  quizzes: Quiz[];
  addQuiz: (name: string, timerEnabled?: boolean, timerDuration?: number) => Quiz;
  removeQuiz: (quizId: string) => void;
  getQuiz: (quizId: string) => Quiz | undefined;
  updateQuiz: (quizId: string, updates: Partial<Omit<Quiz, 'id' | 'questions' | 'createdAt' | 'updatedAt' | 'history'>>) => void;
  addQuizQuestion: (quizId: string, questionData: Omit<QuizQuestion, 'id'>) => QuizQuestion | undefined;
  removeQuizQuestion: (quizId: string, questionId: string) => void;
  updateQuizQuestion: (quizId: string, questionId: string, updates: Partial<Omit<QuizQuestion, 'id'>>) => void;
  getQuizQuestion: (quizId: string, questionId: string) => QuizQuestion | undefined;
  addQuizAttemptToHistory: (quizId: string, attemptData: Omit<QuizAttempt, 'id' | 'date'>) => void;
}

const useFlashyStore = create<FlashyState>()(
  persist(
    (set, get) => ({
      decks: [],
      addDeck: (name) => {
        const newDeck: Deck = {
          id: crypto.randomUUID(),
          name,
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
          term: cardData.term,
          definition: cardData.definition,
          lastReviewed: undefined,
          nextReview: now, 
          easeFactor: 2.5, 
          interval: 0, 
        };
        let SucceededFlashcard: Flashcard | undefined = undefined;
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const existingFlashcard = deck.flashcards.find(
                (fc) => fc.term.toLowerCase() === newFlashcard.term.trim().toLowerCase()
              );
              if (existingFlashcard) {
                // Do not add if term already exists, consumer should handle toast
                return deck; 
              }
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
      giveFlashcardFeedback: (deckId: string, flashcardId: string, feedback: 'easy' | 'medium' | 'hard') => {
        set(state => {
          const decks = state.decks.map(deck => {
            if (deck.id === deckId) {
              const flashcards = deck.flashcards.map(card => {
                if (card.id === flashcardId) {
                  const currentEF = card.easeFactor ?? 2.5;
                  // const currentInterval = card.interval ?? 0; // Not directly used in SM-2 like logic

                  let newInterval: number; // in days
                  let newEF = currentEF;

                  if (feedback === 'hard') {
                    newInterval = 0.5; // Review in 12 hours (0.5 days)
                    newEF = Math.max(1.3, currentEF - 0.20);
                  } else if (feedback === 'medium') {
                    newInterval = 2; // Review in 2 days
                    // newEF remains currentEF for medium (or a slight adjustment if desired)
                  } else { // easy
                    newInterval = 4; // Review in 4 days
                    newEF = currentEF + 0.15;
                  }

                  // Clamp EF to a minimum of 1.3
                  newEF = Math.max(1.3, newEF);
                  
                  const today = new Date();
                  // Calculate next review date based on the new interval in days
                  const nextReviewDate = new Date(today.getTime() + newInterval * 24 * 60 * 60 * 1000);
                  
                  return {
                    ...card,
                    lastReviewed: today.toISOString(),
                    nextReview: nextReviewDate.toISOString(),
                    easeFactor: newEF,
                    interval: newInterval, // Store the new interval in days
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
      },

      // Quiz related state and actions
      quizzes: [],
      addQuiz: (name, timerEnabled = false, timerDuration = 300) => {
        const newQuiz: Quiz = {
          id: crypto.randomUUID(),
          name,
          questions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timerEnabled,
          timerDuration, // in seconds
          history: [],
        };
        set((state) => ({
          quizzes: [...state.quizzes, newQuiz],
        }));
        return newQuiz;
      },
      removeQuiz: (quizId) => {
        set((state) => ({
          quizzes: state.quizzes.filter((quiz) => quiz.id !== quizId),
        }));
      },
      getQuiz: (quizId) => {
        return get().quizzes.find((quiz) => quiz.id === quizId);
      },
      updateQuiz: (quizId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((quiz) =>
            quiz.id === quizId ? { ...quiz, ...updates, updatedAt: new Date().toISOString() } : quiz
          ),
        }));
      },
      addQuizQuestion: (quizId, questionData) => {
        const newQuestion: QuizQuestion = {
          id: crypto.randomUUID(),
          ...questionData,
        };
        let SucceededQuestion: QuizQuestion | undefined = undefined;
        set((state) => ({
          quizzes: state.quizzes.map((quiz) => {
            if (quiz.id === quizId) {
              SucceededQuestion = newQuestion;
              return {
                ...quiz,
                questions: [...quiz.questions, newQuestion],
                updatedAt: new Date().toISOString(),
              };
            }
            return quiz;
          }),
        }));
        return SucceededQuestion;
      },
      removeQuizQuestion: (quizId, questionId) => {
        set((state) => ({
          quizzes: state.quizzes.map((quiz) => {
            if (quiz.id === quizId) {
              return {
                ...quiz,
                questions: quiz.questions.filter((q) => q.id !== questionId),
                updatedAt: new Date().toISOString(),
              };
            }
            return quiz;
          }),
        }));
      },
      updateQuizQuestion: (quizId, questionId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((quiz) => {
            if (quiz.id === quizId) {
              return {
                ...quiz,
                questions: quiz.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return quiz;
          }),
        }));
      },
      getQuizQuestion: (quizId, questionId) => {
        const quiz = get().getQuiz(quizId);
        return quiz?.questions.find(q => q.id === questionId);
      },
      addQuizAttemptToHistory: (quizId, attemptData) => {
        set((state) => ({
          quizzes: state.quizzes.map((quiz) => {
            if (quiz.id === quizId) {
              const newAttempt: QuizAttempt = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                score: attemptData.score,
                totalQuestions: attemptData.totalQuestions,
                timeTaken: attemptData.timeTaken,
                completed: attemptData.completed,
                userAnswers: attemptData.userAnswers, // Ensure this is stored
              };
              const updatedHistory = [newAttempt, ...(quiz.history || [])].slice(0, 20);
              return {
                ...quiz,
                history: updatedHistory,
                updatedAt: new Date().toISOString(),
              };
            }
            return quiz;
          }),
        }));
      },
    }),
    {
      name: 'flashy-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default useFlashyStore;
