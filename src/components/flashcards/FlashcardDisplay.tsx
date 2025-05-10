
"use client";

import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  className?: string;
  isFlipped: boolean;
  // The onFlip prop is removed as the card itself will no longer handle its flip action directly.
  // Flipping is controlled by the parent component (e.g., StudyPage's buttons or global keydown).
}

export function FlashcardDisplay({ flashcard, className, isFlipped }: FlashcardDisplayProps) {
  return (
    <div
      className={cn(
        "flashcard-container w-full h-full rounded-lg", // Removed cursor-pointer as the card itself is not directly interactive for flipping
        isFlipped && "flipped", 
        className
      )}
      // Removed onClick, role, tabIndex, onKeyDown, aria-pressed, and aria-label related to flipping.
      // These are now handled by the parent component.
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          {/* Added text-center to ensure text within the paragraph is centered, complementing parent's flex centering. */}
          <p className="text-2xl md:text-3xl font-semibold text-center">{flashcard.term}</p>
        </div>
        <div className="flashcard-back">
          {/* Added text-center for consistency. */}
          <p className="text-xl md:text-2xl text-center">{flashcard.definition}</p>
        </div>
      </div>
    </div>
  );
}

