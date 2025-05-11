"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, HistoryIcon as PageHistoryIcon, CheckCircle, XCircle, AlertTriangle, Home } from "lucide-react";
import { useQuizHistoryStore } from "@/hooks/useQuizHistory";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Quiz, GlobalQuizHistoryEntry, QuizQuestionOption } from "@/lib/types";
// import { Badge } from "@/components/ui/badge"; // Badge can cause hydration issues if not handled carefully, using span instead for timeout.


export default function QuizHistoryPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const router = useRouter();
  const quizId = params.quizId as string;

  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const globalHistory = useQuizHistoryStore((state) => state.history);

  useEffect(() => {
    if (hydrated && quizId) {
      const currentQuiz = getQuiz(quizId);
      setQuiz(currentQuiz || null);
    }
  }, [hydrated, quizId, getQuiz]);

  const quizSpecificHistory = useMemo(() => {
    if (hydrated && quizId) { 
        return globalHistory
            .filter(entry => entry.quizId === quizId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first
    }
    return [];
  }, [hydrated, globalHistory, quizId]);


  if (!hydrated || quiz === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <PageHistoryIcon className="w-16 h-16 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Loading quiz history...</p>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-background">
        <XCircle className="w-20 h-20 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Quiz Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The quiz for which you are trying to view history could not be found.
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-6 pb-6 border-b">
        <Button variant="outline" size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow duration-300 group">
          <Link href={`/quizzes/${quizId}`}>
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Quiz
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl rounded-xl overflow-hidden bg-card">
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl font-extrabold text-foreground">{quiz.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">Answer History (Last {quizSpecificHistory.length > 0 ? quizSpecificHistory.length : 'N/A'} Questions Answered)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {quizSpecificHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 min-h-[200px] shadow-inner">
              <PageHistoryIcon data-ai-hint="empty history" className="mx-auto h-20 w-20 text-primary mb-6 opacity-70" />
              <h2 className="text-2xl font-semibold text-foreground mb-3">No History Yet</h2>
              <p className="text-md text-muted-foreground max-w-md">
                Once you attempt some questions in this quiz, your answer history will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-25rem)] pr-4">
              <ul className="space-y-6">
                {quizSpecificHistory.map((entry, index) => {
                    const isCorrect = entry.selectedOption === entry.correctOption && entry.selectedOption !== "Timeout";
                    const isTimeout = entry.selectedOption === "Timeout";
                    
                    return(
                      <li key={`${entry.timestamp}-${entry.questionId}-${index}`} className="p-4 border rounded-md bg-background shadow-sm">
                        <div className="mb-2">
                            <div className="text-sm font-medium text-muted-foreground flex items-center"> {/* Changed p to div */}
                                Question:
                                {isTimeout && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                                        <AlertTriangle className="h-3 w-3 mr-1" /> Timed Out
                                    </span>
                                )}
                            </div>
                            <p className="text-md font-semibold text-foreground">{entry.questionText}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm">
                            <span className="font-medium text-muted-foreground">Your Answer: </span>
                            <span className={isCorrect ? "text-green-600 font-semibold" : isTimeout ? "text-amber-700 font-semibold" : "text-destructive font-semibold"}>
                                {entry.selectedOption}
                            </span>
                            </p>
                            {(!isCorrect && !isTimeout) && (
                            <p className="text-sm">
                                <span className="font-medium text-muted-foreground">Correct Answer: </span>
                                <span className="text-green-600 font-semibold">{entry.correctOption}</span>
                            </p>
                            )}
                            {isTimeout && ( // Show correct answer if timed out
                                 <p className="text-sm">
                                 <span className="font-medium text-muted-foreground">Correct Answer: </span>
                                 <span className="text-green-600 font-semibold">{entry.correctOption}</span>
                             </p>
                            )}
                        </div>
                         {entry.isMultipleChoice && entry.options && (
                            <div className="mt-3 pt-2 border-t border-border/50">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Options were:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5">
                                    {entry.options.map(opt => (
                                        <li key={opt.id} className={`text-xs ${opt.text === entry.correctOption ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                            {opt.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
