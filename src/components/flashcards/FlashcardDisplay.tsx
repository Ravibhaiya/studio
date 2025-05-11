// src/components/flashcards/FlashcardDisplay.tsx
"use client";

import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from 'react';

const renderFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];
  // Split by **bolded** parts or <b></b> tags, keeping the delimiters.
  return text.split(/(\*\*.*?\*\*|<b>.*?<\/b>)/gi).filter(part => part.length > 0).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    } else if (part.match(/^<b>(.*?)<\/b>$/i)) { // Check for <b> tags case-insensitively
      const match = part.match(/^<b>(.*?)<\/b>$/i);
      return <strong key={index}>{match ? match[1] : ''}</strong>;
    }
    return part;
  });
};

export function FlashcardDisplay({ flashcard, className, isFlipped, onFlip }: FlashcardDisplayProps) {
  return (
    <div
      className={cn(
        "flashcard-container", 
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
          <div className="w-full whitespace-pre-wrap break-words">
            {renderFormattedText(flashcard.term)}
          </div>
        </div>
        <div
          className={cn(
            "flashcard-back", 
            "text-xl md:text-2xl"
          )}
        >
          <div className="w-full whitespace-pre-wrap break-words">
            {renderFormattedText(flashcard.definition)}
          </div>
        </div>
      </div>
    </div>
  );
}
