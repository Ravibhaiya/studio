
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
        <div className="flashcard-front text-2xl md:text-3xl font-semibold text-center">
          {flashcard.term}
        </div>
        <div className="flashcard-back text-xl md:text-2xl text-center">
          {flashcard.definition}
        </div>
      </div>
    </div>
  );
}

