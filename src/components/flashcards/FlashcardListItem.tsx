// src/components/flashcards/FlashcardListItem.tsx
"use client";

import React from "react";
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
import { formatDistanceToNowStrict, isFuture, isPast, format, differenceInMinutes, differenceInHours } from 'date-fns';

interface FlashcardListItemProps {
  deckId: string;
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
}

const FlashcardListItemComponent = ({ deckId, flashcard, onEdit }: FlashcardListItemProps) => {
  const removeFlashcard = useFlashyStore((state) => state.removeFlashcard);
  const { toast } = useToast();

  const handleDelete = () => {
    removeFlashcard(deckId, flashcard.id);
    toast({
      title: "Flashcard Deleted",
      description: `Flashcard "${flashcard.term}" has been removed.`,
      variant: "destructive",
    });
  };

  const getDueTimeDisplay = () => {
    if (!flashcard.nextReview) return null;

    const nextReviewDate = new Date(flashcard.nextReview);
    const now = new Date();

    if (isPast(nextReviewDate)) {
      return { text: "Due now", isOverdue: true };
    }

    const diffMinutes = differenceInMinutes(nextReviewDate, now);
    if (diffMinutes < 1) return { text: "Due in <1 min", isOverdue: false };
    if (diffMinutes < 60) return { text: `Due in ${diffMinutes} min`, isOverdue: false };

    const diffHours = differenceInHours(nextReviewDate, now);
    if (diffHours < 24) return { text: `Due in ${diffHours} hr${diffHours > 1 ? 's' : ''}`, isOverdue: false };
    
    // For more than 24 hours, formatDistanceToNowStrict is good.
    // If it's today but more than a few hours, format as "Due today at HH:mm"
    if (diffHours < 48 && nextReviewDate.getDate() === now.getDate() && nextReviewDate.getMonth() === now.getMonth() && nextReviewDate.getFullYear() === now.getFullYear()) {
         return { text: `Due today at ${format(nextReviewDate, 'HH:mm')}`, isOverdue: false };
    }
     if (diffHours < 48 && nextReviewDate.getDate() === now.getDate() + 1 && nextReviewDate.getMonth() === now.getMonth() && nextReviewDate.getFullYear() === now.getFullYear()) {
        return { text: `Due tomorrow at ${format(nextReviewDate, 'HH:mm')}`, isOverdue: false };
    }

    return { text: `Due ${formatDistanceToNowStrict(nextReviewDate, { addSuffix: true })}`, isOverdue: false };
  };

  const dueTimeInfo = getDueTimeDisplay();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-card rounded-xl border group">
      <CardContent className="p-5 pb-3 flex-grow">
        <div className="mb-2.5">
          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">{flashcard.term}</h4>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{flashcard.definition}</p>
        {dueTimeInfo && (
          <div className={`mt-3 text-xs flex items-center font-medium ${dueTimeInfo.isOverdue ? 'text-destructive animate-pulse' : 'text-primary'}`}>
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
