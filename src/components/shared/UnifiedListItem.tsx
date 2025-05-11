
"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Edit3, Eye, BookOpenText, ClipboardList } from "lucide-react";
import type { UnifiedItem, Deck, Quiz } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface UnifiedListItemProps {
  item: UnifiedItem;
  onEdit: (itemType: 'deck' | 'quiz', itemId: string) => void;
}

const UnifiedListItemComponent = ({ item, onEdit }: UnifiedListItemProps) => {
  const removeDeck = useFlashyStore((state) => state.removeDeck);
  const removeQuiz = useFlashyStore((state) => state.removeQuiz);
  const { toast } = useToast();

  const handleDelete = () => {
    if (item.type === 'deck') {
      removeDeck(item.data.id);
      toast({
        title: "Deck Deleted",
        description: `Deck "${item.data.name}" has been removed.`,
        variant: "destructive",
      });
    } else {
      removeQuiz(item.data.id);
      toast({
        title: "Quiz Deleted",
        description: `Quiz "${item.data.name}" has been removed.`,
        variant: "destructive",
      });
    }
  };
  
  const dueFlashcardsCount = item.type === 'deck' ? (item.data as Deck).flashcards.filter(fc => {
    if (!fc.nextReview) return true;
    return new Date(fc.nextReview) <= new Date();
  }).length : 0;

  const itemCount = item.type === 'deck' ? (item.data as Deck).flashcards.length : (item.data as Quiz).questions.length;
  const itemLabel = item.type === 'deck' ? 'card' : 'question';
  const studyPath = item.type === 'deck' ? `/decks/${item.data.id}/study` : `/quizzes/${item.data.id}/study`;
  const detailPath = item.type === 'deck' ? `/decks/${item.data.id}` : `/quizzes/${item.data.id}`;
  const ItemIcon = item.type === 'deck' ? BookOpenText : ClipboardList;

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 ease-in-out bg-card rounded-xl border group transform hover:-translate-y-1">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            <Link href={detailPath} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm flex items-center gap-2">
              <ItemIcon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  item.type === 'deck' ? "text-[hsl(var(--chart-1))]" : "text-[hsl(var(--chart-2))]"
                )}
              />
              {item.data.name}
            </Link>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-5 pt-2">
        <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {itemCount} {itemLabel}{itemCount !== 1 ? "s" : ""} total
            </p>
            {item.type === 'deck' && dueFlashcardsCount > 0 && (
                 <p className="text-primary font-medium">
                    {dueFlashcardsCount} card{dueFlashcardsCount !== 1 ? "s" : ""} due
                </p>
            )}
            {item.type === 'deck' && dueFlashcardsCount === 0 && itemCount > 0 && (
                 <p className="text-green-600">
                    All cards reviewed
                </p>
            )}
        </div>
       
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          Last updated: {formatDistanceToNow(new Date(item.data.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 p-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
        <Button variant="default" size="sm" asChild className="flex-1 shadow-md hover:shadow-lg transition-shadow">
          <Link href={studyPath}>
            <Eye className="mr-2 h-4 w-4" /> Study Now
          </Link>
        </Button>
        <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(item.type, item.data.id)} aria-label={`Edit ${item.type}`} className="text-muted-foreground hover:text-primary">
          <Edit3 className="h-5 w-5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" aria-label={`Delete ${item.type}`}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {item.type}
                "{item.data.name}" and all its contents.
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

export const UnifiedListItem = React.memo(UnifiedListItemComponent);

