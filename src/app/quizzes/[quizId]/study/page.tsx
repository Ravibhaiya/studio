
"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, ChevronRight, ClipboardList, RotateCcw, PartyPopper, Home } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizAttemptQuestionDisplay } from "@/components/quiz-questions/QuizAttemptQuestionDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserAnswer {
  questionId: string;
  answer: string | number; // string for free text, number for MC option index
  isCorrect: boolean;
}

export default function QuizStudyPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const router = useRouter();
  const quizId = params.quizId as string;

  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const allQuizzes = useFlashyStore((state) => state.quizzes);

  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | undefined>(undefined);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  useEffect(() => {
    setSessionInitialized(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(undefined);
    setUserAnswers([]);
    setShowFeedback(false);
    setQuizFinished(false);
  }, [quizId]);

  useEffect(() => {
    if (hydrated && quizId && !sessionInitialized) {
      const currentQuizFromStore = getQuiz(quizId);
      setQuiz(currentQuizFromStore || null);
      if (currentQuizFromStore) {
        if (currentQuizFromStore.questions.length === 0) {
          // No questions, effectively finished or an issue
          setQuizFinished(true);
        } else {
            // Reset selectedAnswer for new session or quiz change, only if not showing feedback.
            // This check `!showFeedback` might be redundant if sessionInitialized handles this higher up.
            if (!showFeedback) { 
              setSelectedAnswer(undefined);
            }
        }
      } else {
        setQuiz(null); // Quiz not found
        setQuizFinished(true); // Nothing to study
      }
      setSessionInitialized(true);
    }
  }, [hydrated, quizId, getQuiz, sessionInitialized, allQuizzes, showFeedback]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string | number) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedAnswer === undefined) return;

    let isCorrect = false;
    if (currentQuestion.isMultipleChoice && typeof selectedAnswer === 'number') {
      isCorrect = currentQuestion.options?.[selectedAnswer]?.text === currentQuestion.correctAnswer;
    } else if (!currentQuestion.isMultipleChoice && typeof selectedAnswer === 'string') {
      isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    }

    setUserAnswers([
      ...userAnswers,
      { questionId: currentQuestion.id, answer: selectedAnswer, isCorrect },
    ]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(undefined);
      setShowFeedback(false);
    } else {
      setQuizFinished(true);
    }
  };
  
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(undefined);
    setUserAnswers([]);
    setShowFeedback(false);
    setQuizFinished(false);
    // setSessionInitialized(false); // This would re-fetch the quiz, potentially not desired for a simple restart
  };

  if (!hydrated || quiz === undefined || !sessionInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <RotateCcw className="w-16 h-16 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Loading quiz session...</p>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
        <XCircle className="w-20 h-20 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Quiz Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The quiz you are trying to study could not be found.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Items
          </Link>
        </Button>
      </div>
    );
  }
  
  if (quiz.questions.length === 0 && quizFinished) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-8 bg-card rounded-xl shadow-xl">
        <HelpCircle data-ai-hint="empty box" className="w-24 h-24 text-primary mb-8 opacity-80" />
        <p className="text-3xl font-bold text-foreground mb-3">Quiz is Empty</p>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          This quiz has no questions. Add some questions to start learning!
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href={`/quizzes/${quizId}`}>
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Quiz Details
          </Link>
        </Button>
      </div>
    );
  }

  if (quizFinished && quiz.questions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-8 bg-card rounded-xl shadow-xl">
        <PartyPopper data-ai-hint="trophy celebration" className="w-28 h-28 text-primary mb-8" />
        <h2 className="text-3xl font-bold text-foreground mb-4">Quiz Complete!</h2>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
           <Button onClick={restartQuiz} size="lg" variant="outline" className="group">
            <RotateCcw className="mr-2 h-5 w-5 group-hover:animate-spin-once" />
            Retake Quiz
          </Button>
          <Button asChild size="lg" className="group">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
     return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
       <RotateCcw className="w-16 h-16 text-primary animate-spin" />
       <p className="mt-4 text-lg text-muted-foreground">Loading question...</p>
     </div>
   );
  }

  const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow-md transition-shadow group">
        <Link href={`/quizzes/${quizId}`}>
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Quiz Details
        </Link>
      </Button>
      
      <Card className="overflow-hidden shadow-2xl rounded-xl bg-gradient-to-br from-card via-card to-primary/5 w-full">
        <CardHeader className="p-6 border-b border-border/50">
          <CardTitle className="text-2xl sm:text-3xl text-center font-bold text-foreground tracking-tight">{quiz.name}</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">Quiz Session</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} className="h-3 shadow-inner" />
            <p className="text-sm text-muted-foreground text-center font-medium">
               Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          
          <QuizAttemptQuestionDisplay
            key={currentQuestion.id} // Added key here
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleAnswerSelect}
            showFeedback={showFeedback}
            isCorrect={showFeedback ? userAnswers.find(ans => ans.questionId === currentQuestion.id)?.isCorrect : undefined}
            disabled={showFeedback}
          />
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 p-6 border-t border-border/50 bg-muted/30">
           {!showFeedback ? (
             <Button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === undefined} 
                className="w-full max-w-xs py-3 text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                Submit Answer
             </Button>
           ) : (
            <Button 
                onClick={handleNextQuestion} 
                className="w-full max-w-xs py-3 text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ChevronRight className="ml-2 h-5 w-5" />
             </Button>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}

