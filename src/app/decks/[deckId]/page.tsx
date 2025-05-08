
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpenText, PlusCircle, Eye, Edit3, CalendarClock, FileText } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateFlashcardDialog } from "@/components/flashcards/CreateFlashcardDialog";
import { EditFlashcardDialog } from "@/components/flashcards/EditFlashcardDialog";
import { FlashcardListItem } from "@/components/flashcards/FlashcardListItem";
import { EditDeckDialog } from "@/components/decks/EditDeckDialog";
import type { Deck, Flashcard } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { formatDistanceToNowStrict, isFuture } from 'date-fns';


export default function DeckDetailPage() {
  const hydrated = useHydration();
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined); // undefined for loading, null if not found
  
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isEditFlashcardModalOpen, setIsEditFlashcardModalOpen] = useState(false);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (hydrated && deckId) {
      const foundDeck = getDeck(deckId);
      setDeck(foundDeck || null);
    }
  }, [hydrated, deckId, getDeck]);
  
  // This effect ensures the deck state is updated if the store changes (e.g. flashcard added/removed/edited)
  useEffect(() => {
    if(hydrated && deckId) {
      const currentDeckState = getDeck(deckId);
      // Only update if the deck object reference or flashcard count or updatedAt has changed to avoid unnecessary re-renders
      if (currentDeckState && (currentDeckState !== deck || currentDeckState.flashcards.length !== deck?.flashcards.length || currentDeckState.updatedAt !== deck?.updatedAt)) {
        setDeck(currentDeckState);
      } else if (!currentDeckState && deck !== null) { // Deck was deleted
        setDeck(null);
      }
    }
  // Watching the whole decks array to catch updates on any card within the current deck (e.g., nextReview date change)
  }, [useFlashyStore((state) => state.decks), hydrated, deckId, getDeck, deck]);


  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setIsEditFlashcardModalOpen(true);
  };
  
  const handleDeckUpdated = () => {
     if (deckId) {
      const updatedDeck = getDeck(deckId);
      setDeck(updatedDeck || null);
    }
  }

  if (!hydrated || deck === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <BookOpenText className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading deck...</p>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <BookOpenText className="w-16 h-16 text-destructive" />
        <p className="mt-4 text-xl font-semibold">Deck Not Found</p>
        <p className="text-muted-foreground">
          The deck you are looking for does not exist or may have been deleted.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Decks
          </Link>
        </Button>
      </div>
    );
  }
  
  const filteredFlashcards = deck.flashcards.filter(fc =>
    fc.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fc.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Decks
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <CardTitle className="text-3xl">{deck.name}</CardTitle>
              {deck.description && (
                <CardDescription className="mt-1 text-md">{deck.description}</CardDescription>
              )}
            </div>
            <div className="flex justify-center gap-2">
               <Button variant="outline" onClick={() => setIsEditDeckModalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Deck
              </Button>
              <Button asChild disabled={deck.flashcards.length === 0}>
                <Link href={`/decks/${deck.id}/study`}>
                  <Eye className="mr-2 h-4 w-4" /> Study Deck
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Flashcards ({deck.flashcards.length})</h2>
         <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            type="search" 
            placeholder="Search flashcards..." 
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CreateFlashcardDialog deckId={deck.id} />
        </div>
      </div>

      {deck.flashcards.length === 0 && !searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-xl bg-card min-h-[300px] shadow-sm">
          <FileText data-ai-hint="document empty" className="mx-auto h-20 w-20 text-primary mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">This Deck is Empty</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            Add your first flashcard to this deck to begin studying.
          </p>
          <CreateFlashcardDialog deckId={deck.id} />
        </div>
      ) : filteredFlashcards.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-card p-6 shadow-sm">
          <FileText data-ai-hint="document search" className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="mt-2 text-xl font-semibold">No Flashcards Found</h3>
          <p className="mt-1 text-md text-muted-foreground">
            Your search for &quot;{searchTerm}&quot; did not match any flashcards in this deck.
          </p>
          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 text-lg">
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.sort((a,b) => a.term.localeCompare(b.term)).map((flashcard) => (
            <FlashcardListItem
              key={flashcard.id}
              deckId={deck.id}
              flashcard={flashcard}
              onEdit={handleEditFlashcard}
            />
          ))}
        </div>
      )}

      {editingFlashcard && (
        <EditFlashcardDialog
          deckId={deck.id}
          flashcard={editingFlashcard}
          isOpen={isEditFlashcardModalOpen}
          onClose={() => {
            setIsEditFlashcardModalOpen(false);
            setEditingFlashcard(null);
          }}
        />
      )}
      {deck && (
        <EditDeckDialog
          deck={deck}
          isOpen={isEditDeckModalOpen}
          onClose={() => setIsEditDeckModalOpen(false)}
          onDeckUpdated={handleDeckUpdated}
        />
      )}
    </div>
  );
}

