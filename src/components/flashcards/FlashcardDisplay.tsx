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
      onClick={!isFlipped ? onFlip : undefined} // Card flips on click only when front is shown
    >
      <div className="flashcard-inner">
        <div
          className={cn(
            "flashcard-front", 
            "text-2xl md:text-3xl font-semibold"
          )}
        >
          {flashcard.term}
        </div>
        <div
          className={cn(
            "flashcard-back", 
            "text-xl md:text-2xl"
          )}
        >
          {flashcard.definition}
        </div>
      </div>
    </div>
  );
}
