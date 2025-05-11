// src/components/flashcards/FlashcardDisplay.tsx
"use client";

import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  className?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardDisplay({ flashcard, className, isFlipped, onFlip }: FlashcardDisplayProps) {
  return (
    <div
      className={cn(
        "flashcard-container rounded-lg", // Base styles for perspective
        isFlipped && "flipped", // Applies flip animation
        className // Allows for additional classes for sizing and shadow
      )}
      onClick={!isFlipped ? onFlip : undefined} // Card flips on click only when front is shown
    >
      <div className="flashcard-inner relative w-full h-full flex items-center justify-center"> {/* Handles the 3D transform and ensures it fills container */}
        <div
          className={cn(
            "flashcard-front", // Base styles for front face (bg, text color, flex centering)
            "text-2xl md:text-3xl font-semibold flex items-center justify-center text-center p-6 h-full" // Text styling, centering, padding, and full height
          )}
        >
          <span>{flashcard.term}</span> {/* Wrapped in span */}
        </div>
        <div
          className={cn(
            "flashcard-back", // Base styles for back face (bg, text color, flex centering, initial transform)
            "text-xl md:text-2xl flex items-center justify-center text-center p-6 h-full" // Text styling, centering, padding, and full height
          )}
        >
          <span>{flashcard.definition}</span> {/* Wrapped in span */}
        </div>
      </div>
    </div>
  );
}
