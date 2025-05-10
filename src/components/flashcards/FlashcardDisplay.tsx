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
        "flashcard-container w-full h-full rounded-lg", // Relies on globals.css for perspective and base styling
        isFlipped && "flipped", // Applies flip animation
        className // Allows for additional classes like min-height
      )}
      onClick={!isFlipped ? onFlip : undefined} // Card flips on click only when front is shown
    >
      <div className="flashcard-inner"> {/* Handles the 3D transform */}
        <div
          className={cn(
            "flashcard-front", // Base styles for front face (bg, text color, flex centering)
            "text-2xl md:text-3xl font-semibold" // Text styling
          )}
        >
          <span>{flashcard.term}</span> {/* Wrapped in span */}
        </div>
        <div
          className={cn(
            "flashcard-back", // Base styles for back face (bg, text color, flex centering, initial transform)
            "text-xl md:text-2xl" // Text styling
          )}
        >
          <span>{flashcard.definition}</span> {/* Wrapped in span */}
        </div>
      </div>
    </div>
  );
}
