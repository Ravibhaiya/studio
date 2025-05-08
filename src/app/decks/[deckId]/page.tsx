
"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpenText, PlusCircle, Eye, Edit3, CalendarClock, FileText, Search, Info, ChevronsUpDown } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateFlashcardDialog } from "@/components/flashcards/CreateFlashcardDialog";
import { EditFlashcardDialog } from "@/components/flashcards/EditFlashcardDialog";
import { FlashcardListItem } from "@/components/flashcards/FlashcardListItem";
import { EditDeckDialog } from "@/components/decks/EditDeckDialog";
import type { Deck, Flashcard } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { formatDistanceToNowStrict, isFuture } from 'date-fns';
import { useDebounce } from "@/hooks/useDebounce";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


export default function DeckDetailPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  const params = paramsResult; 
  const router = useRouter();
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  const allDecks = useFlashyStore((state) => state.decks);
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined); 
  
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isEditFlashcardModalOpen, setIsEditFlashcardModalOpen] = useState(false);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);

  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(true);

  useEffect(() => {
    if (hydrated && deckId) {
      const foundDeck = getDeck(deckId);
      setDeck(foundDeck || null);
    }
  }, [hydrated, deckId, getDeck, allDecks]); // Depend on allDecks to re-fetch if store changes
  
  useEffect(() => {
    if (deck) {
      const newFilteredFlashcards = deck.flashcards.filter(fc =>
        fc.term.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        fc.definition.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).sort((a,b) => a.term.localeCompare(b.term));
      setFilteredFlashcards(newFilteredFlashcards);
    } else {
      setFilteredFlashcards([]);
    }
  }, [deck, debouncedSearchTerm]);


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
  
  const dueFlashcardsCount = deck.flashcards.filter(fc => {
    if (!fc.nextReview) return true;
    return new Date(fc.nextReview) <= new Date();
  }).length;


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
        <Button variant="outline" size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow duration-300 group w-full md:w-auto">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to My Decks
          </Link>
        </Button>
        
        <Card className="w-full md:flex-1 shadow-lg rounded-xl bg-card">
            <CardHeader className="p-6 border-b">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">{deck.name}</CardTitle>
                        {deck.description && <CardDescription className="mt-1 text-md">{deck.description}</CardDescription>}
                         <p className="text-sm text-muted-foreground mt-2">
                            {deck.flashcards.length} card{deck.flashcards.length !== 1 ? "s" : ""} total
                            {deck.flashcards.length > 0 && `, ${dueFlashcardsCount} due`}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditDeckModalOpen(true)}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        >
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Deck
                        </Button>
                        <Button 
                            asChild 
                            disabled={deck.flashcards.length === 0}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        >
                        <Link href={`/decks/${deck.id}/study`}>
                            <Eye className="mr-2 h-4 w-4" /> Study Deck
                        </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
      </div>


      <Collapsible
        open={isFlashcardsOpen}
        onOpenChange={setIsFlashcardsOpen}
        className="w-full"
      >
        <Card className="shadow-xl rounded-xl overflow-hidden bg-card">
          <CardHeader className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-colors">
                    <ChevronsUpDown className={`h-6 w-6 transition-transform duration-300 ${isFlashcardsOpen ? 'rotate-180 text-primary' : ''}`} />
                    Flashcards ({deck.flashcards.length})
                  </button>
              </CollapsibleTrigger>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-md mt-4 sm:mt-0">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search flashcards..." 
                    className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <CreateFlashcardDialog deckId={deck.id} />
              </div>
            </div>
             {deck.flashcards.length === 0 && !debouncedSearchTerm && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-center text-xs sm:text-sm text-primary-foreground flex items-center justify-center gap-2 shadow-sm">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                This deck is empty. Add some flashcards to start studying!
              </div>
            )}
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-6">
            {deck.flashcards.length === 0 && !debouncedSearchTerm ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 min-h-[300px] shadow-inner">
                <FileText data-ai-hint="document empty" className="mx-auto h-20 w-20 text-primary mb-6 opacity-70 animate-bounce" />
                <h2 className="text-2xl font-semibold text-foreground mb-3">This Deck is Eager for Knowledge</h2>
                <p className="text-md text-muted-foreground mb-6 max-w-md">
                  No flashcards here yet. Add your first one to populate this deck and begin your study adventure!
                </p>
                <CreateFlashcardDialog deckId={deck.id} />
              </div>
            ) : filteredFlashcards.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted/50 rounded-xl bg-card p-8 shadow-inner min-h-[250px] flex flex-col justify-center items-center">
                <Search data-ai-hint="magnifying glass" className="mx-auto h-16 w-16 text-muted-foreground mb-5 opacity-70" />
                <h3 className="mt-2 text-xl font-semibold text-foreground">No Flashcards Found</h3>
                <p className="mt-1 text-md text-muted-foreground max-w-sm">
                  Your search for &quot;{debouncedSearchTerm}&quot; did not uncover any flashcards. Try a different keyword or clear your search.
                </p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-5 text-md text-primary hover:underline">
                  Clear Search
                </Button>
              </div>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFlashcards.map((flashcard) => (
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
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


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

    
