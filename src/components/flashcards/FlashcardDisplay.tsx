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
        "flashcard-container w-full h-full rounded-lg",
        isFlipped && "flipped",
        className
      )}
      onClick={onFlip} // Card flips on click
    >
      <div className="flashcard-inner">
        <div
          className={cn(
            "flashcard-front", // Centering is handled by globals.css
            "text-2xl md:text-3xl font-semibold" // Text styling
          )}
        >
          <span>{flashcard.term}</span>
        </div>
        <div
          className={cn(
            "flashcard-back", // Centering is handled by globals.css
            "text-xl md:text-2xl" // Text styling
          )}
        >
          <span>{flashcard.definition}</span>
        </div>
      </div>
    </div>
  );
}
