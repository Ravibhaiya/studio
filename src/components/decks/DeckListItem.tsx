"use client";

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

export function DeckListItem({ deck, onEdit }: DeckListItemProps) {
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

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            <Link href={`/decks/${deck.id}`} className="hover:text-primary transition-colors">
              {deck.name}
            </Link>
          </CardTitle>
          <Layers className="h-6 w-6 text-accent" />
        </div>
        {deck.description && (
          <CardDescription className="pt-1 line-clamp-2">{deck.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {deck.flashcards.length} card{deck.flashcards.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: {formatDistanceToNow(new Date(deck.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/decks/${deck.id}/study`}>
            <Eye className="mr-2 h-4 w-4" /> Study
          </Link>
        </Button>
        <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(deck.id)} aria-label="Edit deck">
          <Edit3 className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete deck">
              <Trash2 className="h-4 w-4" />
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
}
