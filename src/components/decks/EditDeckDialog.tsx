
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
import { Label } from "@/components/ui/label";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Deck } from "@/lib/types";

const deckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name is too long"),
});

type DeckFormData = z.infer<typeof deckSchema>;

interface EditDeckDialogProps {
  deck: Deck | null;
  isOpen: boolean;
  onClose: () => void;
  onDeckUpdated?: (deckId: string) => void;
}

export function EditDeckDialog({ deck, isOpen, onClose, onDeckUpdated }: EditDeckDialogProps) {
  const updateDeck = useFlashyStore((state) => state.updateDeck);
  const { toast } = useToast();

  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (deck) {
      form.reset({
        name: deck.name,
      });
    }
  }, [deck, form]);

  const onSubmit = (data: DeckFormData) => {
    if (!deck) return;

    updateDeck(deck.id, { name: data.name });
    toast({
      title: "Deck Updated",
      description: `Deck "${data.name}" has been successfully updated.`,
    });
    form.reset();
    onClose();
    if (onDeckUpdated) {
      onDeckUpdated(deck.id);
    }
  };

  if (!deck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update the name for your deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Deck Name</Label>
            <Input
              id="edit-name"
              {...form.register("name")}
              placeholder="e.g., Spanish Vocabulary"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
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
