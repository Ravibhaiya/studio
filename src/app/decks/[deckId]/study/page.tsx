"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Smile, Meh, Frown, PartyPopper, RefreshCw } from "lucide-react";
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
  const router = useRouter();
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  const giveFlashcardFeedback = useFlashyStore((state) => state.giveFlashcardFeedback);
  const allDecksFromStore = useFlashyStore((state) => state.decks); // To react to global store changes

  const [deck, setDeck] = useState<Deck | null | undefined>(undefined); // undefined for loading, null if not found
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false); // True when current batch of studyCards is done
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (hydrated && deckId) {
      const currentDeckFromStore = getDeck(deckId);
      setDeck(currentDeckFromStore || null);

      if (currentDeckFromStore) {
        if (currentDeckFromStore.flashcards.length > 0) {
          const cardsCurrentlyDue = currentDeckFromStore.flashcards.filter(card => {
            const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0); // Treat undefined/null nextReview as due (new card)
            return nextReviewDate <= new Date();
          });

          setStudyCards(cardsCurrentlyDue);

          if (cardsCurrentlyDue.length > 0) {
            // If there are cards to study, reset session state
            setCurrentIndex(0);
            setShowCompletion(false);
            setIsFlipped(false);
          } else {
            // No cards are currently due. studyCards is empty.
            // The render logic will handle showing the "all caught up" message.
            setCurrentIndex(0); 
            setShowCompletion(false); // No active session if no cards are due from the start
            setIsFlipped(false);
          }
        } else {
          // Deck is empty
          setStudyCards([]);
          setCurrentIndex(0);
          setShowCompletion(false);
          setIsFlipped(false);
        }
      } else {
        // Deck not found
        setDeck(null);
        setStudyCards([]);
      }
    }
  }, [hydrated, deckId, getDeck, allDecksFromStore]); // allDecksFromStore ensures re-filter on any card update in any deck

  const goToNextCard = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletion(true); // Current batch of studyCards is finished
    }
  }, [currentIndex, studyCards.length]);

  const currentCard = studyCards[currentIndex];

  const handleFeedback = useCallback((feedback: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      giveFlashcardFeedback(deckId, currentCard.id, feedback);
      // The store update triggers the useEffect above, which will re-evaluate studyCards.
      goToNextCard();
    }
  }, [currentCard, deckId, giveFlashcardFeedback, goToNextCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCompletion || !currentCard) return; // Don't handle keys if session is complete or no card

      if (event.key === " ") {
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
  }, [showCompletion, isFlipped, handleFeedback, currentCard]);


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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 bg-card rounded-xl shadow-lg">
        <XCircle data-ai-hint="empty box" className="w-24 h-24 text-accent mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">No Flashcards to Study</p>
        <p className="text-md text-muted-foreground mt-2 mb-8 max-w-sm">
          This deck is currently empty. Please add some flashcards to begin your learning journey.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck Details
          </Link>
        </Button>
      </div>
    );
  }

  // Deck has flashcards. If studyCards is empty AND we are not in showCompletion state, it means no cards are currently due.
  if (!showCompletion && studyCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 bg-card rounded-xl shadow-lg">
        <PartyPopper data-ai-hint="party celebration" className="w-28 h-28 text-primary mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-3">All Caught Up!</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          You&apos;ve reviewed all flashcards in this deck that are currently due. Great job!
        </p>
        <div className="flex gap-4">
            <Button asChild variant="outline" className="mt-2">
            <Link href={`/decks/${deckId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck
            </Link>
            </Button>
            <Button onClick={() => router.refresh()} className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
        </div>
        
      </div>
    );
  }
  
  const progress = studyCards.length > 0 ? ((currentIndex + 1) / studyCards.length) * 100 : 0;

  if (showCompletion) {
    // This state means the current batch of studyCards (cards that were due) has been completed.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 bg-card rounded-xl shadow-lg">
        <CheckCircle data-ai-hint="checkmark success" className="w-28 h-28 text-primary mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-3">Session Complete!</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
            You&apos;ve successfully reviewed all cards that were due in this session. Keep up the great work!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild>
            <Link href={`/decks/${deckId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck
            </Link>
          </Button>
           <Button onClick={() => {
             // This effectively re-triggers the useEffect to re-evaluate due cards.
             setShowCompletion(false); 
             // Re-fetch/re-filter based on new nextReview dates
             const currentDeckFromStore = getDeck(deckId);
             if (currentDeckFromStore) {
                 const cardsCurrentlyDue = currentDeckFromStore.flashcards.filter(card => {
                     const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0);
                     return nextReviewDate <= new Date();
                 });
                 setStudyCards(cardsCurrentlyDue);
                 setCurrentIndex(0);
                 setIsFlipped(false);
                 if (cardsCurrentlyDue.length === 0) {
                    // This will ensure the "All Caught Up" message shows if truly no cards are due
                    setShowCompletion(false); 
                 }
             }
           }}>
            <RefreshCw className="mr-2 h-4 w-4" /> Check for more cards
          </Button>
        </div>
      </div>
    );
  }

  // Active study session:
  if (!currentCard && studyCards.length > 0) {
    // This state might occur briefly if studyCards updates and currentIndex is temporarily out of sync
    // or if studyCards has items but rendering is one step behind.
    return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
       <RotateCcw className="w-16 h-16 text-primary animate-spin" />
       <p className="mt-4 text-lg text-muted-foreground">Preparing card...</p>
     </div>
   );
  }
  
  // Ensure currentCard exists before rendering the main study UI
  if (!currentCard) {
      // This is a fallback if, for some reason, no card is available to study,
      // but we haven't hit other conditions. Could be after all cards become non-due.
      // This should ideally be caught by the "All Caught Up" or "Session Complete" logic.
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 bg-card rounded-xl shadow-lg">
             <XCircle data-ai-hint="error warning" className="w-20 h-20 text-accent mb-6" />
            <p className="mt-4 text-2xl font-semibold text-foreground">No more cards to study right now.</p>
            <p className="text-md text-muted-foreground mt-2 mb-6 max-w-sm">
                It seems there are no cards due at this moment. Please check back later or visit the deck details.
            </p>
            <Button asChild className="mt-6">
              <Link href={`/decks/${deckId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck Details
              </Link>
            </Button>
        </div>
      )
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/decks/${deckId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deck Details
        </Link>
      </Button>
      
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">{deck.name} - Study Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
            <p className="text-sm text-muted-foreground text-center">
              Card {currentIndex + 1} of {studyCards.length}
            </p>
          </div>
          
          <FlashcardDisplay 
            flashcard={currentCard} 
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            className="min-h-[20rem] md:min-h-[24rem]" 
          />

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 p-4 border-t">
           {!isFlipped ? (
             <Button onClick={() => setIsFlipped(true)} className="w-full sm:flex-1 py-3 text-base">Show Answer (Space)</Button>
           ) : (
            <div className="flex flex-col sm:flex-row justify-around items-center gap-2 w-full">
              <Button onClick={() => handleFeedback('hard')} variant="outline" className="w-full sm:flex-1 py-3 text-base">
                <Frown className="mr-2 h-5 w-5" /> Hard (1)
              </Button>
              <Button onClick={() => handleFeedback('medium')} variant="outline" className="w-full sm:flex-1 py-3 text-base">
                <Meh className="mr-2 h-5 w-5" /> Medium (2)
              </Button>
              <Button onClick={() => handleFeedback('easy')} variant="outline" className="w-full sm:flex-1 py-3 text-base">
                <Smile className="mr-2 h-5 w-5" /> Easy (3)
              </Button>
            </div>
           )}
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground text-center">
        Keyboard shortcuts: Space to flip, 1 for Hard, 2 for Medium, 3 for Easy (when answer is shown).
      </p>
    </div>
  );
}
