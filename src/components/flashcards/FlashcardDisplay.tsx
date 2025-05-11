// src/components/flashcards/FlashcardDisplay.tsx
"use client";

import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from 'react';

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  className?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

// Helper function to render text with **bold** formatting
const renderFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];
  // Split by **bolded** parts, keeping the delimiters.
  return text.split(/(\*\*.*?\*\*)/g).filter(part => part.length > 0).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    }
    return part;
  });
};

export function FlashcardDisplay({ flashcard, className, isFlipped, onFlip }: FlashcardDisplayProps) {
  return (
    <div
      className={cn(
        "flashcard-container rounded-lg cursor-pointer", 
        isFlipped && "flipped",
        className
      )}
      onClick={onFlip} 
    >
      <div className="flashcard-inner"> 
        <div
          className={cn(
            "flashcard-front", 
            "text-2xl md:text-3xl font-semibold" 
          )}
        >
          <div className="max-h-full w-full overflow-y-auto whitespace-pre-wrap break-words">
            {renderFormattedText(flashcard.term)}
          </div>
        </div>
        <div
          className={cn(
            "flashcard-back", 
            "text-xl md:text-2xl"
          )}
        >
          <div className="max-h-full w-full overflow-y-auto whitespace-pre-wrap break-words">
            {renderFormattedText(flashcard.definition)}
          </div>
        </div>
      </div>
    </div>
  );
}
