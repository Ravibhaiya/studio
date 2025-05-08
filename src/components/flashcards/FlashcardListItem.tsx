"use client";

import { Edit3, Trash2, CalendarClock } from "lucide-react";
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
import { formatDistanceToNowStrict, isFuture } from 'date-fns';

interface FlashcardListItemProps {
  deckId: string;
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
}

export function FlashcardListItem({ deckId, flashcard, onEdit }: FlashcardListItemProps) {
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

  const nextReviewDate = flashcard.nextReview ? new Date(flashcard.nextReview) : null;
  const isDueInFuture = nextReviewDate && isFuture(nextReviewDate);
  const timeToNextReview = nextReviewDate && isDueInFuture 
    ? formatDistanceToNowStrict(nextReviewDate, { addSuffix: true })
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <CardContent className="p-4 pb-2 flex-grow">
        <div className="mb-2">
          <h4 className="font-semibold text-md line-clamp-2">{flashcard.term}</h4>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{flashcard.definition}</p>
        {timeToNextReview && (
          <div className="mt-2 text-xs text-primary flex items-center">
            <CalendarClock className="h-3 w-3 mr-1.5" />
            <span>Due {timeToNextReview}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2 mt-auto">
        <Button variant="ghost" size="sm" onClick={() => onEdit(flashcard)} aria-label="Edit flashcard">
          <Edit3 className="mr-1 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete flashcard">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
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
}
