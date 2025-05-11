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

const renderFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];
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
        "flashcard-container rounded-lg", 
        isFlipped && "flipped", 
        className 
      )}
      onClick={!isFlipped ? onFlip : undefined} 
    >
      <div className="flashcard-inner relative w-full h-full flex items-center justify-center"> 
        <div
          className={cn(
            "flashcard-front", 
            "text-2xl md:text-3xl font-semibold flex items-center justify-center text-center p-6 h-full whitespace-pre-wrap break-words"
          )}
        >
          {renderFormattedText(flashcard.term)}
        </div>
        <div
          className={cn(
            "flashcard-back", 
            "text-xl md:text-2xl flex items-center justify-center text-center p-6 h-full whitespace-pre-wrap break-words"
          )}
        >
          {renderFormattedText(flashcard.definition)}
        </div>
      </div>
    </div>
  );
}
