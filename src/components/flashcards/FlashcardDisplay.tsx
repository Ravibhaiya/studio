"use client";

import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  className?: string;
  isFlipped: boolean;
}

export function FlashcardDisplay({ flashcard, className, isFlipped }: FlashcardDisplayProps) {
  return (
    <div
      className={cn(
        "flashcard-container w-full h-full rounded-lg",
        isFlipped && "flipped", 
        className
      )}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p className="text-2xl md:text-3xl font-semibold text-center m-0">{flashcard.term}</p>
        </div>
        <div className="flashcard-back">
          <p className="text-xl md:text-2xl text-center m-0">{flashcard.definition}</p>
        </div>
      </div>
    </div>
  );
}
