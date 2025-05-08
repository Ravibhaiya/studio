export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  lastReviewed?: string; // ISO date string
  nextReview?: string; // ISO date string
  easeFactor?: number; // For spaced repetition algorithm
  interval?: number; // Current interval in days for spaced repetition
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  flashcards: Flashcard[];
}

