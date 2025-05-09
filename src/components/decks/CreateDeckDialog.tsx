
"use client";

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
import { Label } from "@/components/ui/label";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const deckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name is too long"),
});

type DeckFormData = z.infer<typeof deckSchema>;

interface CreateDeckDialogProps {
  onDeckCreated?: (deckId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDeckDialog({ onDeckCreated, isOpen, onOpenChange }: CreateDeckDialogProps) {
  const addDeck = useFlashyStore((state) => state.addDeck);
  const { toast } = useToast();

  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: DeckFormData) => {
    const newDeck = addDeck(data.name);
    toast({
      title: "Deck Created",
      description: `Deck "${newDeck.name}" has been successfully created.`,
    });
    form.reset();
    onOpenChange(false); // Close dialog using prop
    if (onDeckCreated) {
      onDeckCreated(newDeck.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Enter a name for your new deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Deck Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Spanish Vocabulary"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
