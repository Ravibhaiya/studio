
"use client";

import React, { useState, useEffect } from "react";
import { BookOpenText, Search, Plus } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { DeckListItem } from "@/components/decks/DeckListItem";
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog";
import { EditDeckDialog } from "@/components/decks/EditDeckDialog";
import type { Deck } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks/useDebounce";

export default function HomePage() {
  const hydrated = useHydration();
  const decksFromStore = useFlashyStore((state) => state.decks);
  const getDeck = useFlashyStore((state) => state.getDeck);
  

  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);

  useEffect(() => {
    if (hydrated) {
      const newFilteredDecks = decksFromStore.filter(deck => 
        deck.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setFilteredDecks(newFilteredDecks);
    }
  }, [hydrated, decksFromStore, debouncedSearchTerm]);


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

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <BookOpenText className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading your decks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Decks</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search decks..." 
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* CreateDeckDialog removed from here, will be triggered by FAB */}
        </div>
      </div>

      {decksFromStore.length === 0 && !debouncedSearchTerm ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-card min-h-[350px] shadow-lg">
          <BookOpenText data-ai-hint="book education" className="mx-auto h-24 w-24 text-primary mb-8 animate-bounce" />
          <h2 className="text-3xl font-semibold text-foreground mb-3">Welcome to Flashy!</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            It looks like you don&apos;t have any decks yet. Create your first deck to start your learning journey.
          </p>
          {/* CreateDeckDialog removed from here, will be triggered by FAB */}
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card p-8 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <Search data-ai-hint="magnifying glass" className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="mt-2 text-2xl font-semibold text-foreground">No Decks Found</h3>
          <p className="mt-2 text-md text-muted-foreground max-w-sm">
            Your search for &quot;{debouncedSearchTerm}&quot; did not match any decks. Try a different term or clear the search.
          </p>
          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-6 text-lg text-primary hover:underline">
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredDecks.map((deck) => (
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

      {/* FAB for Create Deck */}
      <div className="fixed bottom-8 right-8 z-50">
        <CreateDeckDialog
          onDeckCreated={handleDeckCreated}
          trigger={
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Create new deck"
            >
              <Plus className="h-7 w-7" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
