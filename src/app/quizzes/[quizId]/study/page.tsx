"use client";

import React, { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, ChevronRight, ClipboardList, RotateCcw, PartyPopper, Home, TimerIcon } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizAttemptQuestionDisplay } from "@/components/quiz-questions/QuizAttemptQuestionDisplay";
import { formatTime } from "@/lib/utils"; 


interface UserAnswer { 
  questionId: string;
  answer: string | number; 
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
  const updateQuizQuestion = useFlashyStore((state) => state.updateQuizQuestion);


  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | undefined>(undefined);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]); 
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  


  useEffect(() => {
    setSessionInitialized(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(undefined);
    setUserAnswers([]);
    setShowFeedback(false);
    setQuizFinished(false);
    setSessionQuestions([]);
    setTimeLeft(null);
  }, [quizId]);

  
  useEffect(() => {
    if (hydrated && quizId && !sessionInitialized) {
      const currentQuizFromStore = getQuiz(quizId);
      setQuiz(currentQuizFromStore || null);
      if (currentQuizFromStore) {
        if (currentQuizFromStore.questions.length === 0) {
          setQuizFinished(true); 
          setSessionQuestions([]);
        } else {
            const sortedQuestions = currentQuizFromStore.questions
              .slice() 
              .sort((a, b) => {
                  const incorrectDiff = (b.incorrectCount ?? 0) - (a.incorrectCount ?? 0);
                  if (incorrectDiff !== 0) return incorrectDiff; 

                  const correctDiff = (a.correctCount ?? 0) - (b.correctCount ?? 0);
                  if (correctDiff !== 0) return correctDiff; 
                  
                  return Math.random() - 0.5; 
              });
            setSessionQuestions(sortedQuestions);

            if (currentQuizFromStore.timerEnabled && currentQuizFromStore.timerDuration) {
              setTimeLeft(currentQuizFromStore.timerDuration); 
            }
            setSelectedAnswer(undefined); 
        }
      } else {
        setQuiz(null); 
        setQuizFinished(true); 
        setSessionQuestions([]);
      }
      setSessionInitialized(true);
    }
  }, [hydrated, quizId, getQuiz, sessionInitialized, allQuizzes]);


  const handleQuestionTimeUp = useCallback(() => {
    const activeQuestion = sessionQuestions[currentQuestionIndex];
    if (!activeQuestion || quizFinished || showFeedback) return;

    setUserAnswers(prevAnswers => [
        ...prevAnswers,
        { questionId: activeQuestion.id, answer: "__TIMED_OUT__", isCorrect: false },
    ]);
    updateQuizQuestion(quizId, activeQuestion.id, { incorrectCount: (activeQuestion.incorrectCount ?? 0) + 1 });
    setShowFeedback(true); 
  }, [sessionQuestions, currentQuestionIndex, quizFinished, showFeedback, setUserAnswers, updateQuizQuestion, quizId]);


  // Timer effect
  useEffect(() => {
    if (quiz?.timerEnabled && timeLeft !== null && timeLeft > 0 && !quizFinished && sessionInitialized && !showFeedback) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(timerId);
            if(!quizFinished && !showFeedback) handleQuestionTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    } else if (quiz?.timerEnabled && timeLeft === 0 && !quizFinished && sessionInitialized && !showFeedback) {
        handleQuestionTimeUp();
    }
  }, [quiz, timeLeft, quizFinished, sessionInitialized, showFeedback, handleQuestionTimeUp]);


  const currentQuestion = sessionQuestions[currentQuestionIndex];

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

    setUserAnswers(prevAnswers =>  [
        ...prevAnswers,
        { questionId: currentQuestion.id, answer: selectedAnswer, isCorrect },
    ]);

    if (isCorrect) {
      updateQuizQuestion(quizId, currentQuestion.id, { correctCount: (currentQuestion.correctCount ?? 0) + 1 });
    } else {
      updateQuizQuestion(quizId, currentQuestion.id, { incorrectCount: (currentQuestion.incorrectCount ?? 0) + 1 });
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = useCallback(() => {
    setSelectedAnswer(undefined);
    setShowFeedback(false);

    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      if (quiz?.timerEnabled && quiz?.timerDuration) {
        setTimeLeft(quiz.timerDuration);
      }
    } else {
      setQuizFinished(true); 
    }
  }, [currentQuestionIndex, sessionQuestions.length, quiz, setTimeLeft, setSelectedAnswer, setShowFeedback, setCurrentQuestionIndex, setQuizFinished ]);
  
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(undefined);
    setUserAnswers([]);
    setShowFeedback(false);
    setQuizFinished(false);

     if (quiz) { 
        const sortedQuestions = quiz.questions
            .slice()
            .sort((a, b) => {
                const incorrectDiff = (b.incorrectCount ?? 0) - (a.incorrectCount ?? 0);
                if (incorrectDiff !== 0) return incorrectDiff;
                const correctDiff = (a.correctCount ?? 0) - (b.correctCount ?? 0);
                if (correctDiff !== 0) return correctDiff;
                return Math.random() - 0.5;
            });
        setSessionQuestions(sortedQuestions);
    }


    if (quiz?.timerEnabled && quiz?.timerDuration) {
        setTimeLeft(quiz.timerDuration); 
    } else {
        setTimeLeft(null);
    }
  };

  if (!hydrated || quiz === undefined || !sessionInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <RotateCcw className="w-16 h-16 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Loading quiz session...</p>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <XCircle className="w-20 h-20 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Quiz Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The quiz you are trying to study could not be found.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }
  
  if (quiz.questions.length === 0 && (quizFinished || !sessionInitialized || sessionInitialized)) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
        <HelpCircle data-ai-hint="empty box" className="w-24 h-24 text-primary mb-8 opacity-80" />
        <p className="text-3xl font-bold text-foreground mb-3">Quiz is Empty</p>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          This quiz has no questions. Add some questions to start learning!
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href={`/`}>
            <Home className="mr-2 h-5 w-5" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  if (quizFinished && sessionQuestions.length > 0) {
     const wasTimeoutOverall = userAnswers.some(ans => ans.answer === "__TIMED_OUT__") && timeLeft === 0 && !showFeedback;


    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-card rounded-xl shadow-xl">
        {wasTimeoutOverall ? ( 
             <TimerIcon data-ai-hint="timer stop" className="w-28 h-28 text-destructive mb-8" />
        ) : (
            <PartyPopper data-ai-hint="trophy celebration" className="w-28 h-28 text-primary mb-8" />
        )}
        <h2 className="text-3xl font-bold text-foreground mb-4">
            {wasTimeoutOverall ? "Session Ended" : "Quiz Complete!"}
        </h2>
         <p className="text-lg text-muted-foreground mb-6 max-w-md">
          You&apos;ve finished this quiz session.
        </p>
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
     <div className="flex flex-col items-center justify-center min-h-screen p-4">
       <RotateCcw className="w-16 h-16 text-primary animate-spin" />
       <p className="mt-4 text-lg text-muted-foreground">Loading question...</p>
     </div>
   );
  }

  const progress = sessionQuestions.length > 0 ? (userAnswers.length / sessionQuestions.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center w-full min-h-screen px-2 sm:px-4 py-8 bg-background">
      <div className="w-full max-w-4xl mb-6">
        <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow-md transition-shadow group">
          <Link href="/">
            <Home className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-2xl rounded-xl bg-card w-full max-w-4xl flex flex-col flex-grow min-h-[calc(100vh-12rem)]">
        <CardHeader className="p-6 md:p-8 border-b border-border/50">
            <div className="flex justify-between items-center">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-left font-bold text-foreground tracking-tight flex-1">{quiz.name}</CardTitle>
                {quiz.timerEnabled && timeLeft !== null && !showFeedback && (
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                        <TimerIcon className="h-6 w-6" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                )}
            </div>
          <p className="text-base md:text-lg text-muted-foreground text-left mt-1">Quiz Session</p>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8 flex-grow flex flex-col justify-center">
          <div className="space-y-2">
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} className="h-4 shadow-inner" />
            <p className="text-base text-muted-foreground text-center font-medium">
               Question {currentQuestionIndex + 1} of {sessionQuestions.length}
            </p>
          </div>
          
          <QuizAttemptQuestionDisplay
            key={currentQuestion.id} 
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleAnswerSelect}
            showFeedback={showFeedback}
            isCorrect={showFeedback ? userAnswers.find(ans => ans.questionId === currentQuestion.id)?.isCorrect : undefined}
            disabled={showFeedback || quizFinished}
          />
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 p-6 md:p-8 border-t border-border/50 bg-muted/30">
           {!showFeedback ? (
             <Button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === undefined || quizFinished} 
                className="w-full max-w-xs py-4 text-xl md:text-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                Submit Answer
             </Button>
           ) : (
            <Button 
                onClick={handleNextQuestion} 
                className="w-full max-w-xs py-4 text-xl md:text-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {currentQuestionIndex === sessionQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ChevronRight className="ml-2 h-6 w-6" />
             </Button>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
