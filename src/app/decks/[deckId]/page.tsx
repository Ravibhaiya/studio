"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpenText, PlusCircle, Eye, Edit3, CalendarClock, FileText, Search, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  useEffect(() => {
    if(hydrated && deckId) {
      const currentDeckState = getDeck(deckId);
      if (currentDeckState && (currentDeckState !== deck || currentDeckState.flashcards.length !== deck?.flashcards.length || currentDeckState.updatedAt !== deck?.updatedAt)) {
        setDeck(currentDeckState);
      } else if (!currentDeckState && deck !== null) { 
        setDeck(null);
      }
    }
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
        <BookOpenText className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading deck details...</p>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
        <BookOpenText className="w-24 h-24 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Deck Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The deck you are looking for might have been spirited away or never existed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Decks
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
    <div className="space-y-10">
      <Button variant="outline" size="lg" asChild className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Link href="/">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to My Decks
        </Link>
      </Button>

      {/* Deck Title and actions are now part of the next section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-card rounded-xl shadow-lg">
        <div>
            <h1 className="text-4xl font-extrabold text-foreground">{deck.name}</h1>
            {deck.description && (
                <p className="mt-2 text-lg text-muted-foreground max-w-xl">{deck.description}</p>
            )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="lg" onClick={() => setIsEditDeckModalOpen(true)} className="shadow-sm hover:shadow-md flex-grow sm:flex-grow-0">
            <Edit3 className="mr-2 h-5 w-5" /> Edit Deck
            </Button>
            <Button size="lg" asChild disabled={deck.flashcards.length === 0} className="shadow-sm hover:shadow-md flex-grow sm:flex-grow-0">
            <Link href={`/decks/${deck.id}/study`}>
                <Eye className="mr-2 h-5 w-5" /> Study Deck
            </Link>
            </Button>
        </div>
      </div>
       {deck.flashcards.length === 0 && (
            <div className="mt-4 p-4 bg-accent/20 border border-accent/50 rounded-lg text-center text-sm text-accent-foreground flex items-center justify-center gap-2 shadow-sm">
              <Info className="h-5 w-5 text-accent" />
              This deck is empty. Add some flashcards to start studying!
            </div>
        )}


      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-card rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-foreground">Flashcards ({deck.flashcards.length})</h2>
         <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search flashcards..." 
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateFlashcardDialog deckId={deck.id} />
        </div>
      </div>

      {deck.flashcards.length === 0 && !searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-card min-h-[350px] shadow-lg">
          <FileText data-ai-hint="document empty" className="mx-auto h-24 w-24 text-primary mb-8 animate-bounce" />
          <h2 className="text-3xl font-semibold text-foreground mb-3">This Deck is Eager for Knowledge</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            No flashcards here yet. Add your first one to populate this deck and begin your study adventure!
          </p>
          <CreateFlashcardDialog deckId={deck.id} />
        </div>
      ) : filteredFlashcards.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card p-8 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <Search data-ai-hint="magnifying glass" className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="mt-2 text-2xl font-semibold text-foreground">No Flashcards Found</h3>
          <p className="mt-2 text-md text-muted-foreground max-w-sm">
            Your search for &quot;{searchTerm}&quot; did not uncover any flashcards. Try a different keyword or clear your search.
          </p>
           <Button variant="link" onClick={() => setSearchTerm("")} className="mt-6 text-lg text-primary hover:underline">
            Clear Search
          </Button>
        </div>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFlashcards.sort((a,b) => a.term.localeCompare(b.term)).map((flashcard) => (
              <FlashcardListItem
                key={flashcard.id}
                deckId={deck.id}
                flashcard={flashcard}
                onEdit={handleEditFlashcard}
              />
            ))}
          </div>
        </TooltipProvider>
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
