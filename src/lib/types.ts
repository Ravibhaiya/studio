export interface Flashcard {
  id: string;
  term: string; // "Front" of the card
  definition: string; // "Back" of the card
  lastReviewed?: string; // ISO date string
  nextReview?: string; // ISO date string
  easeFactor?: number; // For spaced repetition algorithm
  interval?: number; // Current interval in days for spaced repetition
}

export interface Deck {
  id:string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  flashcards: Flashcard[];
}

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options?: QuizQuestionOption[]; // Array of 2 to 4 options if multiple choice
  correctAnswer: string; // If options are provided, this will be the text of the correct option. Otherwise, it's the free-text answer.
  isMultipleChoice: boolean;
}

export interface UserAnswerInAttempt {
  questionId: string;
  selectedAnswer: string | number; // The actual answer/option index selected by the user
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  date: string; // ISO date string
  score: number; // Number of correct answers
  totalQuestions: number;
  timeTaken?: number; // in seconds for the entire attempt
  completed: boolean; // true if finished normally, false if time ran out (for overall quiz if applicable) or abandoned
  userAnswers: UserAnswerInAttempt[]; 
}

export interface Quiz {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  questions: QuizQuestion[];
  timerEnabled?: boolean; // default to false
  timerDuration?: number; // in seconds, e.g., 300 for 5 minutes. If per question, this is the duration for each.
  history?: QuizAttempt[]; // stores last 20 attempts
}

export type UnifiedItem = 
  | { type: 'deck'; data: Deck }
  | { type: 'quiz'; data: Quiz };



