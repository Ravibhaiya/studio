
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Flashcard } from "@/lib/types";

const flashcardSchema = z.object({
  term: z.string().min(1, "Front side content is required").max(200, "Front side content is too long"),
  definition: z.string().min(1, "Back side content is required").max(1000, "Back side content is too long"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface EditFlashcardDialogProps {
  deckId: string;
  flashcard: Flashcard | null;
  isOpen: boolean;
  onClose: () => void;
  onFlashcardUpdated?: (flashcard: Flashcard) => void;
}

export function EditFlashcardDialog({ deckId, flashcard, isOpen, onClose, onFlashcardUpdated }: EditFlashcardDialogProps) {
  const updateFlashcard = useFlashyStore((state) => state.updateFlashcard);
  const getDeck = useFlashyStore((state) => state.getDeck);
  const { toast } = useToast();

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      term: "",
      definition: "",
    },
  });

  useEffect(() => {
    if (flashcard) {
      form.reset({
        term: flashcard.term,
        definition: flashcard.definition,
      });
    }
  }, [flashcard, form, isOpen]); // also reset on isOpen change to ensure latest data

  const onSubmit = (data: FlashcardFormData) => {
    if (!flashcard) return;

    const deck = getDeck(deckId);
    if (deck) {
      const existingFlashcard = deck.flashcards.find(
        (fc) =>
          fc.id !== flashcard.id && // Exclude the current card being edited
          fc.term.toLowerCase() === data.term.trim().toLowerCase()
      );
      if (existingFlashcard) {
        toast({
          title: "Duplicate Flashcard",
          description: "Another flashcard with this front content already exists in this deck.",
          variant: "destructive",
        });
         form.setError("term", {
          type: "manual",
          message: "Another flashcard with this front content already exists.",
        });
        return;
      }
    }


    updateFlashcard(deckId, flashcard.id, data);
    toast({
      title: "Flashcard Updated",
      description: `Flashcard "${data.term.substring(0,30)}..." has been successfully updated.`,
    });
    if (onFlashcardUpdated) {
      onFlashcardUpdated({ ...flashcard, ...data });
    }
    onClose();
  };
  
  if (!flashcard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => {
      if (!openStatus) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
          <DialogDescription>
            Update the content for the front and back of this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor={`edit-term-${flashcard.id}`}>Front</Label>
            <Input
              id={`edit-term-${flashcard.id}`}
              {...form.register("term")}
              className="mt-1"
            />
            {form.formState.errors.term && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.term.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`edit-definition-${flashcard.id}`}>Back</Label>
            <Textarea
              id={`edit-definition-${flashcard.id}`}
              {...form.register("definition")}
              className="mt-1"
              rows={4}
            />
             {form.formState.errors.definition && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.definition.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
