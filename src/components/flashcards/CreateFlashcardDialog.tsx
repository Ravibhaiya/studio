
"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Flashcard } from "@/lib/types";

const flashcardSchema = z.object({
  term: z.string().min(1, "Front side content is required").max(200, "Front side content is too long"),
  definition: z.string().min(1, "Back side content is required").max(1000, "Back side content is too long"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface CreateFlashcardDialogProps {
  deckId: string;
  onFlashcardCreated?: (flashcard: Flashcard) => void;
  triggerButton?: React.ReactNode;
}

export function CreateFlashcardDialog({ deckId, onFlashcardCreated, triggerButton }: CreateFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const addFlashcard = useFlashyStore((state) => state.addFlashcard);
  const { toast } = useToast();

  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      term: "",
      definition: "",
    },
  });

  const onSubmit = (data: FlashcardFormData) => {
    const newFlashcard = addFlashcard(deckId, data);
    if (newFlashcard) {
      toast({
        title: "Flashcard Created",
        description: `Flashcard "${newFlashcard.term.substring(0,30)}..." has been added to the deck.`,
      });
      form.reset();
      setOpen(false);
      if (onFlashcardCreated) {
        onFlashcardCreated(newFlashcard);
      }
    } else {
       toast({
        title: "Error",
        description: "Failed to create flashcard. Deck not found.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Flashcard
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
          <DialogDescription>
            Enter the content for the front and back of your new flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="term">Front</Label>
            <Input
              id="term"
              {...form.register("term")}
              placeholder="e.g., What is the capital of France?"
              className="mt-1"
            />
            {form.formState.errors.term && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.term.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="definition">Back</Label>
            <Textarea
              id="definition"
              {...form.register("definition")}
              placeholder="e.g., Paris"
              className="mt-1"
              rows={4}
            />
             {form.formState.errors.definition && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.definition.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Flashcard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
