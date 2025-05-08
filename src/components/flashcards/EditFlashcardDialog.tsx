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
  term: z.string().min(1, "Term is required").max(200, "Term is too long"),
  definition: z.string().min(1, "Definition is required").max(1000, "Definition is too long"),
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
  }, [flashcard, form]);

  const onSubmit = (data: FlashcardFormData) => {
    if (!flashcard) return;

    updateFlashcard(deckId, flashcard.id, data);
    toast({
      title: "Flashcard Updated",
      description: `Flashcard "${data.term}" has been successfully updated.`,
    });
    if (onFlashcardUpdated) {
      onFlashcardUpdated({ ...flashcard, ...data });
    }
    onClose();
  };
  
  if (!flashcard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
          <DialogDescription>
            Update the term and definition for this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor={`edit-term-${flashcard.id}`}>Term</Label>
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
            <Label htmlFor={`edit-definition-${flashcard.id}`}>Definition</Label>
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
