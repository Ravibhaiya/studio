
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
      <div className="flashcard-inner flex items-center justify-center">
        <div className="flashcard-front text-2xl md:text-3xl font-semibold">
          <span>{flashcard.term}</span>
        </div>
        <div className="flashcard-back text-xl md:text-2xl">
          <span>{flashcard.definition}</span>
        </div>
      </div>
    </div>
  );
}

