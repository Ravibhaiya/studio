// src/components/flashcards/FlashcardListItem.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Edit3, Trash2, CalendarClock, AlertTriangle } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { 
  isPast, 
  differenceInSeconds,
} from 'date-fns';
import { cn } from "@/lib/utils";

interface FlashcardListItemProps {
  deckId: string;
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
}

interface DueTimeInfo {
  text: string;
  isOverdue: boolean;
}

const renderFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];
  // Split by **bolded** parts, keeping the delimiters.
  // Example: "Hello **world**!" becomes ["Hello ", "**world**", "!"]
  return text.split(/(\*\*.*?\*\*)/g).filter(part => part.length > 0).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // If it's a bold part, remove the asterisks and wrap in <strong>
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    }
    // Otherwise, return the text part as is
    return part;
  });
};

const FlashcardListItemComponent = ({ deckId, flashcard, onEdit }: FlashcardListItemProps) => {
  const removeFlashcard = useFlashyStore((state) => state.removeFlashcard);
  const { toast } = useToast();
  const [dueTimeInfo, setDueTimeInfo] = useState<DueTimeInfo | null>(null);

  const calculateDueTimeDisplay = useCallback(() => {
    if (!flashcard.nextReview) return null;

    const nextReviewDate = new Date(flashcard.nextReview);
    const now = new Date();

    if (isPast(nextReviewDate)) {
      return { text: "Due now", isOverdue: true };
    }

    const totalSecondsRemaining = differenceInSeconds(nextReviewDate, now);

    if (totalSecondsRemaining <= 0) {
      return { text: "Due now", isOverdue: true };
    }

    const days = Math.floor(totalSecondsRemaining / (3600 * 24));
    const hours = Math.floor((totalSecondsRemaining % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
    const seconds = Math.floor(totalSecondsRemaining % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`); 
    
    if (parts.length === 0 && totalSecondsRemaining > 0) {
        return { text: "Due in <1s", isOverdue: false };
    }

    const timeStr = parts.join(" ");
    return { text: `Due in ${timeStr}`, isOverdue: false };
  }, [flashcard.nextReview]);

  useEffect(() => {
    setDueTimeInfo(calculateDueTimeDisplay()); 

    const intervalId = setInterval(() => {
      setDueTimeInfo(calculateDueTimeDisplay());
    }, 1000); 

    return () => clearInterval(intervalId); 
  }, [calculateDueTimeDisplay]);


  const handleDelete = () => {
    removeFlashcard(deckId, flashcard.id);
    toast({
      title: "Flashcard Deleted",
      description: `Flashcard "${flashcard.term}" has been removed.`,
      variant: "destructive",
    });
  };


  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-card rounded-xl border group">
      <CardContent className="p-5 pb-3 flex-grow overflow-hidden"> {/* Added overflow-hidden here */}
        <div className="mb-2.5">
          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200 whitespace-pre-wrap break-words break-all">
            {renderFormattedText(flashcard.term)}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words break-all">
          {renderFormattedText(flashcard.definition)}
        </p>
        {dueTimeInfo && (
          <div className={cn(
            "mt-3 text-xs flex items-center font-medium",
            dueTimeInfo.isOverdue ? 'text-destructive animate-pulse' : 'text-primary'
          )}>
            {dueTimeInfo.isOverdue ? <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> : <CalendarClock className="h-3.5 w-3.5 mr-1.5" />}
            <span>{dueTimeInfo.text}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-end gap-2 mt-auto border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={() => onEdit(flashcard)} aria-label="Edit flashcard" className="text-muted-foreground hover:text-primary">
          <Edit3 className="mr-1.5 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete flashcard">
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the flashcard
                "{flashcard.term}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export const FlashcardListItem = React.memo(FlashcardListItemComponent);
