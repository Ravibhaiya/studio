
"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Check, X, Timer, CalendarDays, BarChart3, HelpCircle, Eye } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { formatTime } from "@/lib/utils";
import { QuizAttemptDetailDialog } from "@/components/quizzes/QuizAttemptDetailDialog";

export default function QuizHistoryPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const quizId = params.quizId as string;

  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const allQuizzes = useFlashyStore((state) => state.quizzes);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (hydrated && quizId) {
      const foundQuiz = getQuiz(quizId);
      setQuiz(foundQuiz || null);
    }
  }, [hydrated, quizId, getQuiz, allQuizzes]);

  const handleViewAttemptDetails = (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt);
    setIsDetailDialogOpen(true);
  };

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

  const sortedHistory = quiz.history ? [...quiz.history].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
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
              <CardDescription className="text-lg text-muted-foreground">Attempt History</CardDescription>
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
            <ScrollArea className="max-h-[calc(100vh-21rem)]"> 
              <ul className="divide-y divide-border">
                {sortedHistory.map((attempt) => (
                  <li key={attempt.id} className="py-6 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" /> {formatDistanceToNow(new Date(attempt.date), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 sm:mt-0 self-start sm:self-center">
                        {attempt.timeTaken !== undefined && (
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            <Timer className="mr-1.5 h-4 w-4" /> {formatTime(attempt.timeTaken)}
                          </Badge>
                        )}
                        {attempt.completed ? (
                          <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-700 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700">
                            <Check className="mr-1.5 h-4 w-4" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-sm px-3 py-1 border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-800/30 dark:text-amber-300 dark:border-amber-600">
                            <X className="mr-1.5 h-4 w-4" /> Incomplete
                          </Badge>
                        )}
                         <Button variant="ghost" size="sm" onClick={() => handleViewAttemptDetails(attempt)} className="text-primary hover:text-primary/80">
                            <Eye className="mr-1.5 h-4 w-4" /> View Details
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <QuizAttemptDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        attempt={selectedAttempt}
        quiz={quiz}
      />
    </div>
  );
}

