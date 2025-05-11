// src/hooks/useQuizHistory.ts
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GlobalQuizHistoryEntry } from '@/lib/types';

const MAX_HISTORY_LENGTH = 20;

interface QuizHistoryState {
  history: GlobalQuizHistoryEntry[];
  addQuizResult: (result: Omit<GlobalQuizHistoryEntry, 'timestamp'>) => void;
  // To retrieve history, components will use: const history = useQuizHistoryStore((state) => state.history);
}

export const useQuizHistoryStore = create<QuizHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addQuizResult: (result) => {
        const newEntry: GlobalQuizHistoryEntry = {
          ...result,
          timestamp: new Date().toISOString(),
        };
        set((state) => {
          // Add the new entry to the beginning of the array
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

// Example usage in a component:
// import { useQuizHistoryStore } from '@/hooks/useQuizHistory';
//
// function MyQuizComponent() {
//   const addResult = useQuizHistoryStore((state) => state.addQuizResult);
//   const history = useQuizHistoryStore((state) => state.history);
//
//   const handleQuestionAnswered = (questionText: string, selectedOption: string | 'Timeout', correctOption: string) => {
//     addResult({ questionText, selectedOption, correctOption });
//   };
//
//   return (
//     <div>
//       {/* Your quiz UI */}
//       <h3>History:</h3>
//       <ul>
//         {history.map((item, index) => (
//           <li key={index}>
//             <p>Q: {item.questionText}</p>
//             <p>Your answer: {item.selectedOption}</p>
//             <p>Correct: {item.correctOption}</p>
//             <p><small>{new Date(item.timestamp).toLocaleString()}</small></p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
