"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Check, X, Timer, CalendarDays, BarChart3, HelpCircle, AlertTriangle, TimerIcon, CheckCircle, XCircle, Home } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizAttempt, QuizQuestion } from "@/lib/types";
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
  const allQuizzes = useFlashyStore((state) => state.quizzes); // Dependency for useEffect
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);

  useEffect(() => {
    if (hydrated && quizId) {
      const foundQuiz = getQuiz(quizId);
      setQuiz(foundQuiz || null);
    }
  }, [hydrated, quizId, getQuiz, allQuizzes]);

  const sortedHistory = useMemo(() => {
    if (!quiz || !quiz.history) return [];
    // Already sorted by date desc and limited to 20 in store, but defensive sort/slice
    return [...quiz.history]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [quiz]);

  const quizQuestionsMap = useMemo(() => {
    if (!quiz || !quiz.questions) return new Map<string, QuizQuestion>();
    return new Map(quiz.questions.map(q => [q.id, q]));
  }, [quiz]);


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
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-6 pb-6 border-b">
        <Button variant="outline" size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow duration-300 group">
          <Link href={`/`}>
            <Home className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl rounded-xl overflow-hidden bg-card flex flex-col min-h-[calc(100vh-14rem)]">
        <CardHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-extrabold text-foreground">{quiz.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">Attempt History (Last 20 Attempts)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow flex flex-col">
          {sortedHistory.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px] flex-grow">
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
            <ScrollArea className="flex-grow min-h-0">
              <ul className="space-y-6 pr-4">
                {sortedHistory.map((attempt) => (
                  <li key={attempt.id} className="p-4 border rounded-lg shadow-sm bg-muted/10">
                    <div className="mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                           {formatDistanceToNow(new Date(attempt.date), { addSuffix: true })}
                           {attempt.completed ? <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Completed</Badge> : <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-300">Incomplete</Badge>}
                        </p>
                    </div>

                    <div className="space-y-4">
                      {(attempt.userAnswers || []).map((userAnswer, questionIndex) => {
                        const question = quizQuestionsMap.get(userAnswer.questionId);
                        if (!question) {
                          return (
                            <div key={`unknown-${userAnswer.questionId}-${questionIndex}`} className="p-3 my-2 border rounded-md bg-destructive/10 border-destructive">
                              <p className="font-medium text-sm text-destructive-foreground">
                                <AlertTriangle className="inline-block mr-1.5 h-4 w-4" />
                                Question data not found for this attempt. It might have been deleted from the quiz.
                              </p>
                            </div>
                          );
                        }
                        const isTimedOut = userAnswer.selectedAnswer === "__TIMED_OUT__";
                        let selectedAnswerDisplay: string | React.ReactNode = String(userAnswer.selectedAnswer);
                        if (question.isMultipleChoice && typeof userAnswer.selectedAnswer === 'number' && question.options) {
                            selectedAnswerDisplay = question.options[userAnswer.selectedAnswer]?.text ?? "Invalid Option";
                        }


                        return (
                          <div key={`${attempt.id}-q-${question.id}-${questionIndex}`} className="p-4 border rounded-md bg-card shadow-sm">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Question {questionIndex + 1}</p>
                            <p className="text-md font-semibold text-foreground mb-3">{question.questionText}</p>

                            <div className="space-y-2 text-sm">
                              <div className={cn(
                                "p-2.5 rounded-md border text-sm",
                                userAnswer.isCorrect && !isTimedOut ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700" : (!userAnswer.isCorrect && !isTimedOut ? "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700" : "bg-muted/30 border-border")
                              )}>
                                <span className="font-medium text-muted-foreground">Your Answer: </span>
                                {isTimedOut ? (
                                  <span className="italic text-amber-700 dark:text-amber-500">Timed out</span>
                                ) : (
                                  <span className={cn(userAnswer.isCorrect ? "text-green-700 dark:text-green-400 font-semibold" : "text-destructive dark:text-red-400 font-semibold")}>
                                    {selectedAnswerDisplay}
                                  </span>
                                )}
                              </div>
                              {(!userAnswer.isCorrect || isTimedOut) && ( 
                                <div className="p-2.5 rounded-md border bg-primary/5 border-primary/20 text-sm">
                                  <span className="font-medium text-muted-foreground">Correct Answer: </span>
                                  <span className="text-primary font-semibold">{question.correctAnswer}</span>
                                </div>
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
