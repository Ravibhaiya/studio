// src/components/flashcards/FlashcardDisplay.tsx
"use client";

import type { Flashcard, FlashcardDisplayProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from 'react';

const renderFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];
  return text.split(/(\*\*.*?\*\*|<b>.*?<\/b>)/gi).filter(part => part.length > 0).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    } else if (part.match(/^<b>(.*?)<\/b>$/i)) { 
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
        "relative w-full overflow-hidden rounded-lg shadow-lg bg-card", // Main container acting as viewport
        className // Allows passing width/max-width from parent
      )}
      onClick={onFlip} // Click anywhere on the card area to trigger flip
    >
      {/* Front Card Content Area */}
      {/* This div is in normal flow when !isFlipped, dictating parent height. */}
      {/* When isFlipped, it becomes absolute, slides out, and hides. */}
      <div
        aria-hidden={isFlipped}
        className={cn(
          "p-6 flex flex-col items-center justify-center text-center min-h-[20rem]", // min-h for front
          "transition-all duration-500 ease-in-out",
          isFlipped
            ? "absolute inset-0 -translate-x-full opacity-0 pointer-events-none" // Slide out left, hide
            : "translate-x-0 opacity-100" // In view
        )}
      >
        <div className="w-full whitespace-pre-wrap break-words text-2xl md:text-3xl font-semibold">
          {renderFormattedText(flashcard.term)}
        </div>
      </div>

      {/* Back Card Content Area */}
      {/* This div is in normal flow when isFlipped, dictating parent height. */}
      {/* When !isFlipped, it's absolute, off-screen to the right, and hidden. */}
      <div
        aria-hidden={!isFlipped}
        className={cn(
          "p-6 flex flex-col items-center justify-center text-center min-h-[20rem]", // min-h for back consistency, will grow if content is taller
          "transition-all duration-500 ease-in-out",
          isFlipped
            ? "translate-x-0 opacity-100" // In view
            : "absolute inset-0 translate-x-full opacity-0 pointer-events-none" // Slide in from right, initially hidden
        )}
      >
        <div className="w-full whitespace-pre-wrap break-words text-xl md:text-2xl">
          {renderFormattedText(flashcard.definition)}
        </div>
      </div>
    </div>
  );
}
