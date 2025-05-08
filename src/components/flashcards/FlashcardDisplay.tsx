"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  className?: string;
}

export function FlashcardDisplay({ flashcard, className }: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("flashcard-container w-full h-64 md:h-80 rounded-lg cursor-pointer", isFlipped && "flipped", className)}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && handleFlip()}
      aria-pressed={isFlipped}
      aria-label={`Flashcard. Front: ${flashcard.term}. Click or press space/enter to flip.`}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p className="text-xl md:text-2xl font-semibold">{flashcard.term}</p>
        </div>
        <div className="flashcard-back">
          <p className="text-lg md:text-xl">{flashcard.definition}</p>
        </div>
      </div>
    </div>
  );
}
