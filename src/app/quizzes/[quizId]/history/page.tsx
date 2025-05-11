"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Check, X, Timer, CalendarDays, BarChart3, HelpCircle, AlertTriangle, TimerIcon, CheckCircle, XCircle } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { formatTime, cn } from "@/lib/utils";

export default function QuizHistoryPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const quizId = params.quizId as string;

  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const allQuizzes = useFlashyStore((state) => state.quizzes);

  useEffect(() => {
    if (hydrated && quizId) {
      const foundQuiz = getQuiz(quizId);
      setQuiz(foundQuiz || null);
    }
  }, [hydrated, quizId, getQuiz, allQuizzes]);


  if (!hydrated || quiz === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ClipboardList className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading quiz history...</p>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
        <ClipboardList className="w-24 h-24 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Quiz Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The quiz you are looking for might have been removed or never existed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Items
          </Link>
        </Button>
      </div>
    );
  }

  const sortedHistory = quiz.history 
    ? [...quiz.history]
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20) // Keep only the last 20 attempts
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-6 pb-6 border-b">
        <Button variant="outline" size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow duration-300 group">
          <Link href={`/quizzes/${quizId}`}>
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Quiz Details
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl rounded-xl overflow-hidden bg-card">
        <CardHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-extrabold text-foreground">{quiz.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">Attempt History (Last 20)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {sortedHistory.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <HelpCircle data-ai-hint="question mark" className="w-20 h-20 text-muted-foreground mb-6 opacity-70" />
              <p className="text-xl font-semibold text-foreground">No History Yet</p>
              <p className="text-md text-muted-foreground mt-2 max-w-sm">
                This quiz hasn&apos;t been attempted yet. Take the quiz to see your history here!
              </p>
               <Button asChild className="mt-8">
                  <Link href={`/quizzes/${quizId}/study`}>
                     Start Quiz Now
                  </Link>
                </Button>
            </div>
          ) : (
            <ScrollArea className="h-[70vh]"> 
              <ul className="space-y-8 pr-4"> 
                {sortedHistory.map((attempt, attemptIndex) => (
                  <li key={attempt.id} className="p-4 border rounded-lg shadow-sm bg-muted/10">
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                         <p className="text-lg font-semibold text-foreground">
                           {formatDistanceToNow(new Date(attempt.date), { addSuffix: true })}
                         </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {attempt.timeTaken !== undefined && (
                          <Badge variant="outline" className="px-2 py-0.5">
                            <Timer className="mr-1 h-3 w-3" /> {formatTime(attempt.timeTaken)}
                          </Badge>
                        )}
                        {attempt.completed ? (
                          <Badge variant="secondary" className="px-2 py-0.5 bg-green-100 text-green-700 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700">
                            <Check className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-2 py-0.5 border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-800/30 dark:text-amber-300 dark:border-amber-600">
                            <X className="mr-1 h-3 w-3" /> Incomplete
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-1">
                      {(attempt.userAnswers || []).map((userAnswer, questionIndex) => {
                        const question = quiz.questions.find(q => q.id === userAnswer.questionId);
                        if (!question) {
                          return (
                            <div key={`unknown-${userAnswer.questionId}-${questionIndex}`} className="p-3 my-2 border rounded-md bg-destructive/10 border-destructive">
                              <p className="font-medium text-sm text-destructive-foreground">
                                <AlertTriangle className="inline-block mr-1.5 h-4 w-4" />
                                Question data not found.
                              </p>
                            </div>
                          );
                        }
                        const isTimedOut = userAnswer.selectedAnswer === "__TIMED_OUT__";
                        let selectedAnswerDisplay: string | React.ReactNode = String(userAnswer.selectedAnswer);
                        if (question.isMultipleChoice && typeof userAnswer.selectedAnswer === 'number' && question.options) {
                            selectedAnswerDisplay = question.options[userAnswer.selectedAnswer]?.text ?? "Invalid Option Index";
                        }


                        return (
                          <div key={`${attempt.id}-q-${question.id}`} className="p-3 border rounded-md bg-card shadow-sm">
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Question {questionIndex + 1}</p>
                            <p className="text-md font-semibold text-foreground mb-2">{question.questionText}</p>

                            <div className="space-y-1.5 text-sm">
                              <div className={cn(
                                "p-2 rounded-md border text-sm",
                                userAnswer.isCorrect && !isTimedOut ? "bg-green-500/5 border-green-500/20" : (!userAnswer.isCorrect && !isTimedOut ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border")
                              )}>
                                <span className="font-medium">Your Answer: </span>
                                {isTimedOut ? (
                                  <span className="italic text-amber-700 dark:text-amber-500">Timed out</span>
                                ) : (
                                  <span className={cn(userAnswer.isCorrect ? "text-green-700 dark:text-green-400" : "text-destructive dark:text-red-400")}>
                                    {selectedAnswerDisplay}
                                  </span>
                                )}
                              </div>
                              {!userAnswer.isCorrect && !isTimedOut && (
                                <div className="p-2 rounded-md border bg-primary/5 border-primary/20 text-sm">
                                  <span className="font-medium">Correct Answer: </span>
                                  <span className="text-primary font-semibold">{question.correctAnswer}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                                {isTimedOut ? (
                                    <Badge variant="outline" size="sm" className="border-amber-500 text-amber-600 dark:text-amber-400">
                                        <TimerIcon className="h-3.5 w-3.5 mr-1" /> Timed Out
                                    </Badge>
                                ) : userAnswer.isCorrect ? (
                                    <Badge variant="secondary" size="sm" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Correct
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" size="sm" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700">
                                        <XCircle className="h-3.5 w-3.5 mr-1" /> Incorrect
                                    </Badge>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

