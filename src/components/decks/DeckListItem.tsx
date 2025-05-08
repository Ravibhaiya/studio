// src/components/decks/DeckListItem.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Layers, Trash2, Edit3, Eye } from "lucide-react";
import type { Deck } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDistanceToNow } from 'date-fns';

interface DeckListItemProps {
  deck: Deck;
  onEdit: (deckId: string) => void;
}

const DeckListItemComponent = ({ deck, onEdit }: DeckListItemProps) => {
  const removeDeck = useFlashyStore((state) => state.removeDeck);
  const { toast } = useToast();

  const handleDelete = () => {
    removeDeck(deck.id);
    toast({
      title: "Deck Deleted",
      description: `Deck "${deck.name}" has been removed.`,
      variant: "destructive",
    });
  };
  
  const dueFlashcardsCount = deck.flashcards.filter(fc => {
    if (!fc.nextReview) return true; // New cards are due
    return new Date(fc.nextReview) <= new Date();
  }).length;

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 ease-in-out bg-card rounded-xl border group transform hover:-translate-y-1">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            <Link href={`/decks/${deck.id}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              {deck.name}
            </Link>
          </CardTitle>
          {/* <BookCopy className="h-6 w-6 text-primary/70 group-hover:text-primary transition-colors duration-200" /> Removed icon */}
        </div>
        {deck.description && (
          <CardDescription className="pt-1.5 text-sm line-clamp-2 text-muted-foreground">{deck.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-5 pt-0">
        <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {deck.flashcards.length} card{deck.flashcards.length !== 1 ? "s" : ""} total
            </p>
            {dueFlashcardsCount > 0 ? (
                 <p className="text-primary font-medium">
                    {dueFlashcardsCount} card{dueFlashcardsCount !== 1 ? "s" : ""} due
                </p>
            ) : (
                 <p className="text-green-600">
                    All cards reviewed
                </p>
            )}
        </div>
       
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          Last updated: {formatDistanceToNow(new Date(deck.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 p-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
        <Button variant="default" size="sm" asChild className="flex-1 shadow-md hover:shadow-lg transition-shadow">
          <Link href={`/decks/${deck.id}/study`}>
            <Eye className="mr-2 h-4 w-4" /> Study Now
          </Link>
        </Button>
        <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(deck.id)} aria-label="Edit deck" className="text-muted-foreground hover:text-primary">
          <Edit3 className="h-5 w-5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" aria-label="Delete deck">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the deck
                "{deck.name}" and all its flashcards.
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
        </div>
      </CardFooter>
    </Card>
  );
};

export const DeckListItem = React.memo(DeckListItemComponent);
