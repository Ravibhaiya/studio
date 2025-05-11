
"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Smile, Meh, Frown, PartyPopper, Home } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Deck, Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FlashcardDisplay } from "@/components/flashcards/FlashcardDisplay";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudyPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const router = useRouter();
  const deckId = params.deckId as string;

  const getDeck = useFlashyStore((state) => state.getDeck);
  const giveFlashcardFeedback = useFlashyStore((state) => state.giveFlashcardFeedback);
  const allDecksFromStore = useFlashyStore((state) => state.decks); 

  const [deck, setDeck] = useState<Deck | null | undefined>(undefined); 
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false); 
  const [isFlipped, setIsFlipped] = useState(false);
  const [allCardsReviewedForNow, setAllCardsReviewedForNow] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);


  useEffect(() => {
    // Effect to reset session when deckId changes
    setSessionInitialized(false);
    // Reset other relevant states if necessary, e.g., currentIndex, showCompletion
    setCurrentIndex(0);
    setShowCompletion(false);
    setIsFlipped(false);
    setAllCardsReviewedForNow(false);
  }, [deckId]);

  useEffect(() => {
    // This effect runs to set up the session when deckId changes (due to sessionInitialized being false)
    // or on initial hydration.
    if (hydrated && deckId && !sessionInitialized) {
      const currentDeckFromStore = getDeck(deckId);
      setDeck(currentDeckFromStore || null);

      if (currentDeckFromStore) {
        if (currentDeckFromStore.flashcards.length > 0) {
          const cardsCurrentlyDue = currentDeckFromStore.flashcards.filter(card => {
            const nextReviewDate = card.nextReview ? new Date(card.nextReview) : new Date(0); 
            return nextReviewDate <= new Date();
          }).sort((a, b) => (new Date(a.nextReview || 0)).getTime() - (new Date(b.nextReview || 0)).getTime());


          if (cardsCurrentlyDue.length > 0) {
            setStudyCards(cardsCurrentlyDue);
            setCurrentIndex(0);
            setShowCompletion(false); 
            setIsFlipped(false);
            setAllCardsReviewedForNow(false);
          } else {
            setStudyCards([]);
            setCurrentIndex(0); 
            setShowCompletion(false); 
            setIsFlipped(false);
            setAllCardsReviewedForNow(true);
          }
        } else { 
          setStudyCards([]);
          setCurrentIndex(0);
          setShowCompletion(false); 
          setIsFlipped(false);
          setAllCardsReviewedForNow(false); 
        }
      } else { 
        setDeck(null);
        setStudyCards([]);
        setAllCardsReviewedForNow(false);
      }
      setSessionInitialized(true); // Mark session as initialized
    }
  }, [hydrated, deckId, getDeck, sessionInitialized, allDecksFromStore]); 

  const goToNextCard = useCallback(() => {
    setIsFlipped(false); 
    setTimeout(() => {
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShowCompletion(true); 
      }
    }, 300); 
  }, [currentIndex, studyCards.length]);

  const currentCard = studyCards[currentIndex];

  const handleFeedback = useCallback((feedback: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      giveFlashcardFeedback(deckId, currentCard.id, feedback);
      goToNextCard(); 
    }
  }, [currentCard, deckId, giveFlashcardFeedback, goToNextCard]);


  if (!hydrated || deck === undefined || !sessionInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <RotateCcw className="w-16 h-16 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Loading study session...</p>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <XCircle className="w-20 h-20 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Deck Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The deck you are trying to study could not be found. It might have been deleted.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }
  
  if (deck.flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
        <XCircle data-ai-hint="empty box" className="w-24 h-24 text-primary mb-8 opacity-80" />
        <p className="text-3xl font-bold text-foreground mb-3">Deck is Empty</p>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          This deck has no flashcards yet. Add some to start your learning adventure!
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Deck Details
          </Link>
        </Button>
      </div>
    );
  }

  if (showCompletion && studyCards.length > 0) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
        <CheckCircle data-ai-hint="checkmark success" className="w-28 h-28 text-primary mb-8" />
        <h2 className="text-3xl font-bold text-foreground mb-4">Session Complete!</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            You&apos;ve successfully reviewed all cards that were due in this session. Keep up the great work!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild size="lg" className="group">
            <Link href="/">
              <Home className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (allCardsReviewedForNow && studyCards.length === 0 && !showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
        <PartyPopper data-ai-hint="party celebration" className="w-28 h-28 text-primary mb-8" />
        <h2 className="text-3xl font-bold text-foreground mb-4">All Caught Up!</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg">
          There are no cards currently due for review in this deck. Fantastic work!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" size="lg" className="group">
            <Link href="/">
                <Home className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            </Button>
        </div>
      </div>
    );
  }
  
  const progress = studyCards.length > 0 ? ((showCompletion ? studyCards.length : currentIndex) / studyCards.length) * 100 : 0;

  if (!currentCard && studyCards.length > 0 && !showCompletion) { 
     return (
     <div className="flex flex-col items-center justify-center min-h-screen p-4">
       <RotateCcw className="w-16 h-16 text-primary animate-spin" />
       <p className="mt-4 text-lg text-muted-foreground">Preparing card...</p>
     </div>
   );
  }
  
  if (!currentCard && studyCards.length === 0 && !showCompletion && !allCardsReviewedForNow) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
            <XCircle data-ai-hint="error warning" className="w-24 h-24 text-destructive mb-8 opacity-80" />
            <p className="text-3xl font-bold text-foreground mb-3">No Cards to Study</p>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              An unexpected state occurred. There are no cards available for study at this moment.
            </p>
            <Button asChild className="mt-6" size="lg">
            <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Back to Home
            </Link>
            </Button>
        </div>
    )
  }


  return (
    <div className="flex flex-col items-center w-full min-h-screen px-2 sm:px-4 py-8">
      <div className="w-full max-w-4xl mb-6">
        <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow-md transition-shadow group">
          <Link href="/">
            <Home className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-2xl rounded-xl bg-gradient-to-br from-card via-card to-primary/5 w-full max-w-4xl flex flex-col flex-grow">
        <CardHeader className="p-6 sm:p-8 border-b border-border/50">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-center font-bold text-foreground tracking-tight">{deck.name}</CardTitle>
          <p className="text-base md:text-lg text-muted-foreground text-center mt-1">Study Session</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 flex-grow flex flex-col">
          <div className="space-y-2 flex-shrink-0">
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} className="h-3 sm:h-4 shadow-inner" />
            <p className="text-sm sm:text-base text-muted-foreground text-center font-medium">
               Card {studyCards.length > 0 ? currentIndex + 1 : 0} of {studyCards.length}
            </p>
          </div>
          
          {currentCard && (
            <div className="flex-grow flex items-center justify-center">
                 <FlashcardDisplay 
                    flashcard={currentCard} 
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(f => !f)}
                    className="w-full max-w-xl aspect-[16/10] shadow-lg rounded-lg"
                />
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 md:p-10 border-t border-border/50 bg-muted/30">
           {!isFlipped ? (
             <Button onClick={() => setIsFlipped(true)} className="w-full max-w-xs py-3 sm:py-4 text-lg sm:text-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">Show Answer</Button>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-xl">
              <Button onClick={() => handleFeedback('hard')} variant="outline" className="py-3 sm:py-4 text-base sm:text-lg shadow-sm hover:shadow-md hover:bg-destructive/10 hover:border-destructive text-destructive group">
                <Frown className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:animate-pulse" /> Hard
              </Button>
              <Button onClick={() => handleFeedback('medium')} variant="outline" className="py-3 sm:py-4 text-base sm:text-lg shadow-sm hover:shadow-md hover:bg-amber-500/10 hover:border-amber-500 text-amber-600 group">
                <Meh className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:animate-pulse" /> Medium
              </Button>
              <Button onClick={() => handleFeedback('easy')} variant="outline" className="py-3 sm:py-4 text-base sm:text-lg shadow-sm hover:shadow-md hover:bg-green-500/10 hover:border-green-500 text-green-600 group">
                <Smile className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:animate-pulse" /> Easy
              </Button>
            </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}

