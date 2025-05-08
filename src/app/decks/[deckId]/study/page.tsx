"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw, CheckCircle, XCircle, Smile, Meh, Frown } from "lucide-react";
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
  const giveFlashcardFeedback = useFlashyStore((state) => state.giveFlashcardFeedback);
  
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // To control flip state for feedback buttons

  useEffect(() => {
    if (hydrated && deckId) {
      const foundDeck = getDeck(deckId);
      setDeck(foundDeck || null);
      if (foundDeck && foundDeck.flashcards.length > 0) {
        // For study, we might want to filter cards based on nextReview date
        // For now, let's study all cards or a subset
        const cardsToStudy = foundDeck.flashcards.filter(card => {
          const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0); // review immediately if no date
          return nextReviewDate <= new Date(); // Only study cards due today or earlier
        });
        
        if (cardsToStudy.length > 0) {
          setStudyCards(isShuffled ? shuffleArray(cardsToStudy) : cardsToStudy);
        } else {
          // If no cards are due, study all cards shuffled or in order
           setStudyCards(isShuffled ? shuffleArray(foundDeck.flashcards) : foundDeck.flashcards);
        }
        setCurrentIndex(0);
        setShowCompletion(false);
        setIsFlipped(false);
      }
    }
  }, [hydrated, deckId, getDeck, isShuffled]); // Removed isShuffled from initial load, handle it separately
  
  useEffect(() => {
    if (deck && deck.flashcards) {
      const cardsDueOrAll = deck.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      });
      
      let currentStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck.flashcards;
      const newStudyCards = isShuffled ? shuffleArray(currentStudySet) : currentStudySet;
      
      if (JSON.stringify(newStudyCards.map(c => c.id)) !== JSON.stringify(studyCards.map(c => c.id))) {
        setStudyCards(newStudyCards);
        if (currentIndex >= newStudyCards.length) {
          setCurrentIndex(Math.max(0, newStudyCards.length -1));
        }
      }
    }
  }, [deck?.flashcards, isShuffled, useFlashyStore((state) => state.decks)]);


  const goToNextCard = useCallback(() => {
    setIsFlipped(false); // Reset flip state for the next card
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletion(true);
    }
  }, [currentIndex, studyCards.length]);

  const handleFeedback = (feedback: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      giveFlashcardFeedback(deckId, currentCard.id, feedback);
      goToNextCard();
    }
  };

  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false); // Reset flip state
      setCurrentIndex((prev) => prev - 1);
    }
  };
  
  const handleShuffle = () => {
    const cardsDueOrAll = deck?.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      }) || [];
    let currentStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck?.flashcards || [];
    
    setStudyCards(shuffleArray(currentStudySet));
    setIsShuffled(true);
    setCurrentIndex(0);
    setShowCompletion(false);
    setIsFlipped(false);
  };

  const handleReset = () => {
    if (deck) {
       const cardsDueOrAll = deck.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      });
      let currentStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck.flashcards;

      setStudyCards(isShuffled ? shuffleArray(currentStudySet) : currentStudySet); // Keep shuffle state or reset to original order
      setCurrentIndex(0);
      setShowCompletion(false);
      setIsFlipped(false);
    }
  };
  
  const handleRestartStudy = () => {
    setIsShuffled(false); // Default to not shuffled for restart, user can re-shuffle
     if (deck) {
       const cardsDueOrAll = deck.flashcards.filter(card => {
        const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
        return nextReviewDate <= new Date();
      });
      let initialStudySet = cardsDueOrAll.length > 0 ? cardsDueOrAll : deck.flashcards;
      setStudyCards(isShuffled ? shuffleArray(initialStudySet) : initialStudySet);
    }
    setCurrentIndex(0);
    setShowCompletion(false);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCompletion) return;
      if (event.key === "ArrowRight" && isFlipped) { // Only allow next via arrow if card is flipped
        // Assuming medium feedback for arrow right, or just show feedback buttons
         // For now, let's not auto-submit feedback with arrow keys to avoid complexity
      } else if (event.key === "ArrowLeft") {
        goToPrevCard();
      } else if (event.key === " ") { // Space bar to flip
        event.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (event.key === "1") handleFeedback('hard');
        if (event.key === "2") handleFeedback('medium');
        if (event.key === "3") handleFeedback('easy');
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNextCard, goToPrevCard, showCompletion, isFlipped, handleFeedback]);


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

  if (studyCards.length === 0 && deck.flashcards.length > 0) {
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
              <AlertTitle>No card selected</AlertTitle>
              <AlertDescription>Something went wrong, no card to display.</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
           {!isFlipped ? (
             <Button onClick={() => setIsFlipped(true)} className="w-full sm:w-auto">Show Answer</Button>
           ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
              <Button onClick={() => handleFeedback('hard')} variant="outline" className="w-full sm:w-auto">
                <Frown className="mr-2 h-4 w-4" /> Hard (1)
              </Button>
              <Button onClick={() => handleFeedback('medium')} variant="outline" className="w-full sm:w-auto">
                <Meh className="mr-2 h-4 w-4" /> Medium (2)
              </Button>
              <Button onClick={() => handleFeedback('easy')} variant="outline" className="w-full sm:w-auto">
                <Smile className="mr-2 h-4 w-4" /> Easy (3)
              </Button>
            </div>
           )}
        </CardFooter>
         <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShuffle} title="Shuffle cards">
              <Shuffle className="mr-2 h-4 w-4" /> Shuffle
            </Button>
            <Button variant="outline" onClick={handleReset} title="Reset progress for this session">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Session
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={goToPrevCard} disabled={currentIndex === 0} variant="outline" title="Previous card (Left Arrow)">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button onClick={goToNextCard} variant="default" title="Next card (Right Arrow)" disabled={!isFlipped && studyCards.length > 0}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
