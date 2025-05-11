"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Check, X, Timer, CalendarDays, BarChart3, HelpCircle, AlertTriangle, TimerIcon, CheckCircle, XCircle, Home } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizQuestion, UserAnswerInAttempt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatTime, cn } from "@/lib/utils";

interface ProcessedAnswerHistoryItem {
  uniqueDisplayKey: string;
  questionText: string | React.ReactNode;
  selectedAnswerDisplay: string | React.ReactNode;
  isCorrect: boolean;
  isTimedOut: boolean;
  correctAnswerText: string | React.ReactNode;
  originalAttemptDate: string; // For sorting
}

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

  const quizQuestionsMap = useMemo(() => {
    if (!quiz || !quiz.questions) return new Map<string, QuizQuestion>();
    return new Map(quiz.questions.map(q => [q.id, q]));
  }, [quiz]);

  const processedAnswerHistory = useMemo(() => {
    if (!quiz || !quiz.history || quiz.history.length === 0) return [];

    const allIndividualAnswers: ProcessedAnswerHistoryItem[] = [];

    quiz.history.forEach(attempt => {
      if (attempt.userAnswers && attempt.userAnswers.length > 0) {
        attempt.userAnswers.forEach((userAnswerEntry, entryIndex) => {
          const question = quizQuestionsMap.get(userAnswerEntry.questionId);
          const isTimedOut = userAnswerEntry.selectedAnswer === "__TIMED_OUT__";
          let displayableSelectedAnswer: string | React.ReactNode;

          if (isTimedOut) {
            displayableSelectedAnswer = <span className="italic text-muted-foreground">Answer not given (timed out)</span>;
          } else if (question && question.isMultipleChoice && typeof userAnswerEntry.selectedAnswer === 'number' && question.options) {
            const selectedOption = question.options[userAnswerEntry.selectedAnswer];
            displayableSelectedAnswer = selectedOption ? selectedOption.text : "Invalid Option";
          } else {
            displayableSelectedAnswer = String(userAnswerEntry.selectedAnswer);
          }

          if (question) {
            allIndividualAnswers.push({
              uniqueDisplayKey: `${attempt.id}-${userAnswerEntry.questionId}-${entryIndex}`, // Unique key for list item
              questionText: question.questionText,
              selectedAnswerDisplay: displayableSelectedAnswer,
              isCorrect: userAnswerEntry.isCorrect,
              isTimedOut: isTimedOut,
              correctAnswerText: question.correctAnswer,
              originalAttemptDate: attempt.date,
            });
          } else {
            // Fallback for when question data might be missing
            allIndividualAnswers.push({
              uniqueDisplayKey: `unknown-${attempt.id}-${userAnswerEntry.questionId}-${entryIndex}`,
              questionText: (
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2 shrink-0 text-destructive" />
                  <span>Original question data not found for this answer.</span>
                </div>
              ),
              selectedAnswerDisplay: displayableSelectedAnswer,
              isCorrect: userAnswerEntry.isCorrect,
              isTimedOut: isTimedOut,
              correctAnswerText: <span className="italic text-muted-foreground">N/A (original question unknown)</span>,
              originalAttemptDate: attempt.date,
            });
          }
        });
      }
    });

    // Sort all answers by the date of their original attempt, most recent first
    allIndividualAnswers.sort((a, b) => new Date(b.originalAttemptDate).getTime() - new Date(a.originalAttemptDate).getTime());
    
    return allIndividualAnswers.slice(0, 20); // Return the last 20 individual question answers
  }, [quiz, quizQuestionsMap]);


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
              <CardDescription className="text-lg text-muted-foreground">Answer History (Last 20 Questions Answered)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow flex flex-col">
          {processedAnswerHistory.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px] flex-grow">
              <HelpCircle data-ai-hint="question mark" className="w-20 h-20 text-muted-foreground mb-6 opacity-70" />
              <p className="text-xl font-semibold text-foreground">No History Yet</p>
              <p className="text-md text-muted-foreground mt-2 max-w-sm">
                This quiz hasn&apos;t been attempted yet, or no answers have been recorded. Take the quiz to see your history here!
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
                {processedAnswerHistory.map((item) => {
                  let boxStyle = "bg-muted/30 border-border"; // Default
                  if (item.isTimedOut) {
                      boxStyle = "bg-amber-50 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700";
                  } else if (item.isCorrect) {
                      boxStyle = "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700";
                  } else { // Incorrect and not timed out
                      boxStyle = "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700";
                  }
                  
                  return (
                    <li key={item.uniqueDisplayKey} className="p-4 border rounded-lg shadow-sm bg-card"> {/* Changed from bg-muted/10 */}
                      <div className="text-md font-semibold text-foreground mb-3">{item.questionText}</div>
                      
                      <div className="space-y-2 text-sm">
                         <div className={cn("p-2.5 rounded-md border text-sm", boxStyle)}>
                          <span className="font-medium text-muted-foreground">Your Answer: </span>
                          {/* Display logic for selected answer */}
                          {item.isTimedOut ? item.selectedAnswerDisplay : 
                            (typeof item.selectedAnswerDisplay === 'string' && item.isCorrect) ? item.selectedAnswerDisplay :
                            typeof item.selectedAnswerDisplay === 'string' ? 
                            <span className={cn(item.isCorrect ? "text-green-700 dark:text-green-400 font-semibold" : "text-destructive dark:text-red-400 font-semibold")}>
                                {item.selectedAnswerDisplay}
                            </span> :
                            item.selectedAnswerDisplay // Handles JSX like "Invalid Option"
                          }
                        </div>

                        {(!item.isCorrect || item.isTimedOut) && ( 
                          <div className="p-2.5 rounded-md border bg-primary/5 border-primary/20 text-sm">
                            <span className="font-medium text-muted-foreground">Correct Answer: </span>
                            <span className="text-primary font-semibold">{item.correctAnswerText}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
