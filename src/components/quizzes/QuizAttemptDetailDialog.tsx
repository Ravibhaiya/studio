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
import { CheckCircle, XCircle, AlertTriangle, TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
                  <div key={`unknown-${userAnswer.questionId}-${index}`} className="p-4 border rounded-lg bg-destructive/10 border-destructive">
                    <p className="text-destructive-foreground font-semibold">
                      <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                      Question data not found for this answer. (Question ID: {userAnswer.questionId})
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
                      {question.options.map((option, optionIdx) => {
                        const isSelected = optionIdx === userAnswer.selectedAnswer;
                        const isCorrectOption = option.text === question.correctAnswer;

                        let optionBgCn = "bg-muted/30";
                        let optionTextCn = "";
                        let optionRingCn = "border-border";

                        if (isCorrectOption) {
                          optionBgCn = "bg-green-500/10";
                          optionTextCn = "font-semibold text-green-700 dark:text-green-400";
                          optionRingCn = "border-green-500/50";
                        }
                        
                        if (isSelected && !isCorrectOption) { // User selected this wrong option
                          optionBgCn = "bg-destructive/10";
                          optionTextCn = "font-semibold text-destructive dark:text-red-400";
                          optionRingCn = "border-destructive/50";
                        } else if (isSelected && isCorrectOption) { // User selected the correct option
                           optionTextCn = "font-semibold text-green-700 dark:text-green-400"; // Ensure text is styled if selected and correct
                        }
                        
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "flex items-center justify-between p-3 border rounded-md text-sm",
                              optionBgCn,
                              optionRingCn
                            )}
                          >
                            <span className={cn(optionTextCn)}>
                                {option.text}
                            </span>
                            <div className="flex items-center gap-2">
                                {isSelected && !isTimedOut && (
                                    <Badge variant={userAnswer.isCorrect ? "default" : "destructive"} 
                                           className={cn("text-xs px-2 py-0.5", userAnswer.isCorrect ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700" : "bg-red-100 text-red-700 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700")}>
                                    {userAnswer.isCorrect ? <CheckCircle className="h-3.5 w-3.5 mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
                                    Your Answer
                                    </Badge>
                                )}
                                {isCorrectOption && !isSelected && !isTimedOut && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-500 text-green-600 dark:text-green-400">
                                        Correct Answer
                                    </Badge>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : ( // Free text
                    <div className="mb-3 space-y-2">
                      <div className={cn("p-3 border rounded-md", userAnswer.isCorrect && !isTimedOut ? "bg-green-500/10 border-green-500/30" : (!userAnswer.isCorrect && !isTimedOut ? "bg-destructive/10 border-destructive/30" : "bg-muted/30") )}>
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
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700">
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
