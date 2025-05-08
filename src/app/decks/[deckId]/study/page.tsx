
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Smile, Meh, Frown } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Deck, Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FlashcardDisplay } from "@/components/flashcards/FlashcardDisplay";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudyPage() {
  const hydrated = useHydration();
  const params = useParams();
  // const router = useRouter(); // useRouter was imported but not used. Removed.
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  const giveFlashcardFeedback = useFlashyStore((state) => state.giveFlashcardFeedback);
  
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (hydrated && deckId) {
      const foundDeck = getDeck(deckId);
      setDeck(foundDeck || null);
      if (foundDeck && foundDeck.flashcards.length > 0) {
        const cardsToStudy = foundDeck.flashcards.filter(card => {
          const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
          return nextReviewDate <= new Date();
        });
        
        setStudyCards(cardsToStudy.length > 0 ? cardsToStudy : foundDeck.flashcards);
        setCurrentIndex(0);
        setShowCompletion(false);
        setIsFlipped(false);
      } else if (foundDeck && foundDeck.flashcards.length === 0) {
        setStudyCards([]); // Ensure studyCards is empty if deck is empty
      }
    }
  }, [hydrated, deckId, getDeck]);
  
  useEffect(() => {
    // This effect reacts to changes in the deck's flashcards from the store
    // e.g. if a card is added/deleted or feedback updates its review date elsewhere
    if (deck && deck.flashcards) {
      const cardsDueOrAll = deck.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      });
      
      let currentStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck.flashcards;
      const newStudyCards = currentStudySet;
      
      const currentCardIds = studyCards.map(c => c.id).join(',');
      const newCardIds = newStudyCards.map(c => c.id).join(',');

      if (newCardIds !== currentCardIds) {
        setStudyCards(newStudyCards);
        if (currentIndex >= newStudyCards.length && newStudyCards.length > 0) {
          setCurrentIndex(newStudyCards.length - 1);
        } else if (newStudyCards.length === 0) {
           setCurrentIndex(0); // Reset index if no cards left
        } else if (newStudyCards.length > 0 && studyCards.length === 0){
           // Was empty, now has cards (e.g. after studying all due, then choosing to study all)
           setCurrentIndex(0);
           setShowCompletion(false);
           setIsFlipped(false);
        }
      }
    }
  }, [deck?.flashcards, useFlashyStore((state) => state.decks), currentIndex, studyCards]); // Added currentIndex and studyCards to deps for stable comparison

  const goToNextCard = useCallback(() => {
    setIsFlipped(false); 
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletion(true);
    }
  }, [currentIndex, studyCards.length]);

  const currentCard = studyCards[currentIndex];

  const handleFeedback = useCallback((feedback: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      giveFlashcardFeedback(deckId, currentCard.id, feedback);
      goToNextCard(); // This now serves as the "next card" action
    }
  }, [currentCard, deckId, giveFlashcardFeedback, goToNextCard]);
  
  const handleRestartStudy = () => {
     if (deck) {
       const cardsDueOrAll = deck.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      });
      let initialStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck.flashcards;
      setStudyCards(initialStudySet);
    }
    setCurrentIndex(0);
    setShowCompletion(false);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCompletion) return;

      if (event.key === " ") { 
        event.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) { // Only allow feedback keys if card is flipped
        if (event.key === "1") handleFeedback('hard');
        if (event.key === "2") handleFeedback('medium');
        if (event.key === "3") handleFeedback('easy');
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCompletion, isFlipped, handleFeedback]);


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
  
  // This must come after deck.flashcards.length > 0 check, and after studyCards is initialized by useEffects
  if (!showCompletion && studyCards.length === 0 && deck.flashcards.length > 0) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <CheckCircle className="w-16 h-16 text-primary" />
        <p className="mt-4 text-xl font-semibold">All Cards Reviewed for Now!</p>
        <p className="text-muted-foreground">You've caught up on all due cards. Check back later or study all cards.</p>
         <Button onClick={handleRestartStudy} className="mt-4">Study All Cards</Button>
        <Button asChild variant="outline" className="mt-2">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck
          </Link>
        </Button>
      </div>
    );
  }
  
  const progress = studyCards.length > 0 ? ((currentIndex + 1) / studyCards.length) * 100 : 0;

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <CheckCircle className="w-20 h-20 text-primary mb-6" />
        <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
        <p className="text-lg text-muted-foreground mb-8">You've reviewed all cards in this study session.</p>
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
            <FlashcardDisplay 
              flashcard={currentCard} 
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              className="min-h-[20rem] md:min-h-[24rem]" 
            />
          ) : (
            <Alert>
              <AlertTitle>No card to display</AlertTitle>
              <AlertDescription>Loading card or an issue occurred.</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 p-4 border-t">
           {!isFlipped ? (
             <Button onClick={() => setIsFlipped(true)} className="w-full sm:w-auto">Show Answer</Button>
           ) : (
            <div className="flex flex-col sm:flex-row justify-around items-center gap-2 w-full">
              <Button onClick={() => handleFeedback('hard')} variant="outline" className="w-full sm:w-auto flex-1">
                <Frown className="mr-2 h-4 w-4" /> Hard (1)
              </Button>
              <Button onClick={() => handleFeedback('medium')} variant="outline" className="w-full sm:w-auto flex-1">
                <Meh className="mr-2 h-4 w-4" /> Medium (2)
              </Button>
              <Button onClick={() => handleFeedback('easy')} variant="outline" className="w-full sm:w-auto flex-1">
                <Smile className="mr-2 h-4 w-4" /> Easy (3)
              </Button>
            </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}


    