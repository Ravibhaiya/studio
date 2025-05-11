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
  correctCount?: number; // Number of times answered correctly
  incorrectCount?: number; // Number of times answered incorrectly
}

export interface QuizAttempt {
  id: string; // Unique ID for this attempt
  quizId: string;
  timestamp: string; // ISO date string when the attempt was completed or recorded
  score: number; // Number of correct answers
  totalQuestions: number;
  duration?: number; // Optional: time taken in seconds
  userAnswers: UserQuizAnswer[]; // Detailed answers for this attempt
  completed: boolean; // Whether the quiz was fully completed or exited early
}

export interface UserQuizAnswer {
  questionId: string;
  selectedAnswer: string | number | 'Timeout'; // User's selected answer or if it timed out
  isCorrect: boolean;
  questionText: string; // Storing for history display
  correctAnswerText: string; // Storing for history display
  options?: QuizQuestionOption[]; // Storing options for MCQs for history display
  isMultipleChoice: boolean; // Storing for history display
}


export interface Quiz {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  questions: QuizQuestion[];
  timerEnabled?: boolean; // default to false
  timerDuration?: number; // in seconds, e.g., 300 for 5 minutes. If per question, this is the duration for each.
  attempts?: QuizAttempt[]; // Array to store quiz attempt history
}

export type UnifiedItem = 
  | { type: 'deck'; data: Deck }
  | { type: 'quiz'; data: Quiz };

// For the global quiz history module
export interface GlobalQuizHistoryEntry {
  quizId: string;
  questionText: string;
  selectedOption: string | 'Timeout'; // 'Timeout' if unanswered in time
  correctOption: string;
  timestamp: string; // ISO date string for when the result was recorded
}

