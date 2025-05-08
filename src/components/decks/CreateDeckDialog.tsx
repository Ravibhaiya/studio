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

const deckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name is too long"),
  description: z.string().max(250, "Description is too long").optional(),
});

type DeckFormData = z.infer<typeof deckSchema>;

export function CreateDeckDialog({ onDeckCreated }: { onDeckCreated?: (deckId: string) => void }) {
  const [open, setOpen] = useState(false);
  const addDeck = useFlashyStore((state) => state.addDeck);
  const { toast } = useToast();

  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: DeckFormData) => {
    const newDeck = addDeck(data.name, data.description);
    toast({
      title: "Deck Created",
      description: `Deck "${newDeck.name}" has been successfully created.`,
    });
    form.reset();
    setOpen(false);
    if (onDeckCreated) {
      onDeckCreated(newDeck.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Enter a name and optional description for your new deck.
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
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="e.g., Common verbs and nouns"
              className="mt-1"
            />
             {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
