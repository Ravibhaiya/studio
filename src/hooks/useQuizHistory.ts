// src/hooks/useQuizHistory.ts
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GlobalQuizHistoryEntry } from '@/lib/types';

const MAX_HISTORY_LENGTH = 20;

interface QuizHistoryState {
  history: GlobalQuizHistoryEntry[];
  addQuizResult: (result: Omit<GlobalQuizHistoryEntry, 'timestamp'>) => void;
}

export const useQuizHistoryStore = create<QuizHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addQuizResult: (result) => { // result includes quizId, questionText, selectedOption, correctOption
        const newEntry: GlobalQuizHistoryEntry = {
          ...result,
          timestamp: new Date().toISOString(),
        };
        set((state) => {
          // Add the new entry to the beginning of the array to show newest first
          const updatedHistory = [newEntry, ...state.history];
          
          // Keep only the last MAX_HISTORY_LENGTH entries
          if (updatedHistory.length > MAX_HISTORY_LENGTH) {
            return { history: updatedHistory.slice(0, MAX_HISTORY_LENGTH) };
          }
          return { history: updatedHistory };
        });
      },
    }),
    {
      name: 'flashy-global-quiz-history-storage', // Unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
