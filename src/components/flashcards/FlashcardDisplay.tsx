
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
      className={cn("flashcard-container w-full h-full rounded-lg cursor-pointer", isFlipped && "flipped", className)}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onFlip()}
      aria-pressed={isFlipped}
      aria-label={`Flashcard. Front: ${flashcard.term}. Click or press space/enter to flip.`}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p className="text-2xl md:text-3xl font-semibold">{flashcard.term}</p>
        </div>
        <div className="flashcard-back">
          <p className="text-xl md:text-2xl">{flashcard.definition}</p>
        </div>
      </div>
    </div>
  );
}
