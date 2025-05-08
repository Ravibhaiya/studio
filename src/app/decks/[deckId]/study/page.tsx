"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Deck, Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FlashcardDisplay } from "@/components/flashcards/FlashcardDisplay";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export default function StudyPage() {
  const hydrated = useHydration();
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (hydrated && deckId) {
      const foundDeck = getDeck(deckId);
      setDeck(foundDeck || null);
      if (foundDeck && foundDeck.flashcards.length > 0) {
        setStudyCards(foundDeck.flashcards);
        setCurrentIndex(0);
        setShowCompletion(false);
      }
    }
  }, [hydrated, deckId, getDeck]);
  
  // Ensure studyCards updates if deck flashcards change (e.g., during study session if editing was possible)
  useEffect(() => {
    if (deck && deck.flashcards) {
      const newStudyCards = isShuffled ? shuffleArray(deck.flashcards) : deck.flashcards;
      // Only update if card IDs or order has genuinely changed
      if (JSON.stringify(newStudyCards.map(c => c.id)) !== JSON.stringify(studyCards.map(c => c.id))) {
        setStudyCards(newStudyCards);
        // Reset current index if the card list changes significantly
        if (currentIndex >= newStudyCards.length) {
          setCurrentIndex(Math.max(0, newStudyCards.length -1));
        }
      }
    }
  }, [deck?.flashcards, isShuffled]); // Removed studyCards from dependency to avoid loop

  const goToNextCard = useCallback(() => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletion(true);
    }
  }, [currentIndex, studyCards.length]);

  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  
  const handleShuffle = () => {
    setStudyCards(shuffleArray(studyCards));
    setIsShuffled(true);
    setCurrentIndex(0);
    setShowCompletion(false);
  };

  const handleReset = () => {
    if (deck) {
      setStudyCards(deck.flashcards);
      setIsShuffled(false);
      setCurrentIndex(0);
      setShowCompletion(false);
    }
  };
  
  const handleRestartStudy = () => {
    handleReset(); // Resets to original order or shuffles if shuffle was last active
    if(isShuffled && deck) { // If it was shuffled, re-shuffle the original deck
        setStudyCards(shuffleArray(deck.flashcards));
    }
    setCurrentIndex(0);
    setShowCompletion(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCompletion) return;
      if (event.key === "ArrowRight") {
        goToNextCard();
      } else if (event.key === "ArrowLeft") {
        goToPrevCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNextCard, goToPrevCard, showCompletion]);


  if (!hydrated || deck === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <RotateCcw className="w-16 h-16 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Loading study session...</p>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <XCircle className="w-16 h-16 text-destructive" />
        <p className="mt-4 text-xl font-semibold">Deck Not Found</p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Decks
          </Link>
        </Button>
      </div>
    );
  }

  if (deck.flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <XCircle className="w-16 h-16 text-accent" />
        <p className="mt-4 text-xl font-semibold">No Flashcards to Study</p>
        <p className="text-muted-foreground">This deck is empty. Add some flashcards to start studying.</p>
        <Button asChild className="mt-6">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck
          </Link>
        </Button>
      </div>
    );
  }
  
  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? ((currentIndex + 1) / studyCards.length) * 100 : 0;

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <CheckCircle className="w-20 h-20 text-primary mb-6" />
        <h2 className="text-3xl font-bold mb-2">Deck Complete!</h2>
        <p className="text-lg text-muted-foreground mb-8">You've reviewed all cards in this deck.</p>
        <div className="flex gap-4">
          <Button onClick={handleRestartStudy}>
            <RotateCcw className="mr-2 h-4 w-4" /> Study Again
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/decks/${deckId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/decks/${deckId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck Details
        </Link>
      </Button>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{deck.name} - Study Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
            <p className="text-sm text-muted-foreground text-center">
              Card {currentIndex + 1} of {studyCards.length}
            </p>
          </div>
          
          {currentCard ? (
            <FlashcardDisplay flashcard={currentCard} className="min-h-[20rem] md:min-h-[24rem]" />
          ) : (
            <Alert>
              <AlertTitle>No card selected</AlertTitle>
              <AlertDescription>Something went wrong, no card to display.</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShuffle} title="Shuffle cards (Ctrl+S)">
              <Shuffle className="mr-2 h-4 w-4" /> Shuffle
            </Button>
            <Button variant="outline" onClick={handleReset} title="Reset order and progress (Ctrl+R)">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={goToPrevCard} disabled={currentIndex === 0} variant="outline" title="Previous card (Left Arrow)">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button onClick={goToNextCard} variant="default" title="Next card (Right Arrow)">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
