"use client";

import { useState } from "react";
import { BookOpenText } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { DeckListItem } from "@/components/decks/DeckListItem";
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog";
import { EditDeckDialog } from "@/components/decks/EditDeckDialog";
import type { Deck } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const hydrated = useHydration();
  const decks = useFlashyStore((state) => state.decks);
  const getDeck = useFlashyStore((state) => state.getDeck);
  const router = useRouter();

  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditDeck = (deckId: string) => {
    const deckToEdit = getDeck(deckId);
    if (deckToEdit) {
      setEditingDeck(deckToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDeckCreated = (deckId: string) => {
    // Optional: Navigate to the newly created deck or its edit page
    // router.push(`/decks/${deckId}`);
  };

  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <BookOpenText className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your decks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            type="search" 
            placeholder="Search decks..." 
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CreateDeckDialog onDeckCreated={handleDeckCreated} />
        </div>
      </div>

      {filteredDecks.length === 0 ? (
        <div className="text-center py-10">
          <BookOpenText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No decks found</h3>
          {decks.length > 0 && searchTerm && (
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear the search.
            </p>
          )}
          {decks.length === 0 && !searchTerm && (
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new deck.
            </p>
          )}
          {searchTerm && (
             <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">Clear Search</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDecks.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((deck) => (
            <DeckListItem key={deck.id} deck={deck} onEdit={handleEditDeck} />
          ))}
        </div>
      )}

      {editingDeck && (
        <EditDeckDialog
          deck={editingDeck}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDeck(null);
          }}
        />
      )}
    </div>
  );
}
