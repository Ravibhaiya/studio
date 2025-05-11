
"use client";

import React from "react";
import type { Quiz, QuizAttempt, QuizQuestion, QuizQuestionOption, UserAnswerInAttempt } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimerIcon } from "lucide-react";

interface QuizAttemptDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: QuizAttempt | null;
  quiz: Quiz | null;
}

export function QuizAttemptDetailDialog({ isOpen, onClose, attempt, quiz }: QuizAttemptDetailDialogProps) {
  if (!isOpen || !attempt || !quiz) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quiz Attempt Details</DialogTitle>
          <DialogDescription>
            Review your answers for the quiz: <span className="font-semibold">{quiz.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
          <div className="space-y-6 py-4">
            {attempt.userAnswers.map((userAnswer, index) => {
              const question = quiz.questions.find(q => q.id === userAnswer.questionId);
              if (!question) {
                return (
                  <div key={`unknown-${index}`} className="p-4 border rounded-lg bg-destructive/10 border-destructive">
                    <p className="text-destructive-foreground font-semibold">
                      <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                      Question data not found for one of your answers.
                    </p>
                  </div>
                );
              }

              const isTimedOut = userAnswer.selectedAnswer === "__TIMED_OUT__";

              return (
                <div key={question.id} className="p-4 border rounded-lg shadow-sm bg-card">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Question {index + 1}</p>
                  <p className="text-lg font-semibold text-foreground mb-3">{question.questionText}</p>

                  {question.isMultipleChoice && question.options ? (
                    <div className="space-y-2 mb-3">
                      {question.options.map((option) => {
                        const isSelected = question.options?.findIndex(o => o.text === option.text) === userAnswer.selectedAnswer;
                        const isCorrectOption = option.text === question.correctAnswer;
                        
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "flex items-center justify-between p-3 border rounded-md text-sm",
                              isCorrectOption && "bg-green-500/10 border-green-500/30",
                              isSelected && !isCorrectOption && "bg-destructive/10 border-destructive/30",
                              !isSelected && !isCorrectOption && "bg-muted/30"
                            )}
                          >
                            <span className={cn(isCorrectOption && "font-semibold text-green-700 dark:text-green-400", isSelected && !isCorrectOption && "font-semibold text-destructive dark:text-red-400")}>
                                {option.text}
                            </span>
                            <div className="flex items-center gap-2">
                                {isSelected && (
                                    <Badge variant={userAnswer.isCorrect ? "default" : "destructive"} className="bg-opacity-80">
                                    {userAnswer.isCorrect ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                                    Your Answer
                                    </Badge>
                                )}
                                {isCorrectOption && !isSelected && (
                                    <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                                        Correct
                                    </Badge>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mb-3 space-y-2">
                      <div className={cn("p-3 border rounded-md", userAnswer.isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30")}>
                        <p className="text-xs text-muted-foreground">Your Answer:</p>
                        {isTimedOut ? (
                             <p className="italic text-amber-600 dark:text-amber-400 font-medium">Timed out</p>
                        ) : (
                            <p className={cn("font-semibold", userAnswer.isCorrect ? "text-green-700 dark:text-green-400" : "text-destructive dark:text-red-400")}>
                                {String(userAnswer.selectedAnswer)}
                            </p>
                        )}
                      </div>
                      {!userAnswer.isCorrect && !isTimedOut && (
                        <div className="p-3 border rounded-md bg-green-500/10 border-green-500/30">
                          <p className="text-xs text-muted-foreground">Correct Answer:</p>
                          <p className="font-semibold text-green-700 dark:text-green-400">{question.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {isTimedOut ? (
                     <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
                        <TimerIcon className="h-4 w-4 mr-1" /> Timed Out
                    </Badge>
                  ) : userAnswer.isCorrect ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" /> Correct
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" /> Incorrect
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
