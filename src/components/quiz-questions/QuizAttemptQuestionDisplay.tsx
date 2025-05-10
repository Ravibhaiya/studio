
"use client";

import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizAttemptQuestionDisplayProps {
  question: QuizQuestion;
  selectedAnswer: string | number | undefined;
  onAnswerChange: (answer: string | number) => void;
  showFeedback: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}

export function QuizAttemptQuestionDisplay({
  question,
  selectedAnswer,
  onAnswerChange,
  showFeedback,
  isCorrect,
  disabled = false,
}: QuizAttemptQuestionDisplayProps) {
  
  const getOptionClassName = (optionText: string, optionIndex: number) => {
    if (!showFeedback) {
      return selectedAnswer === optionIndex ? "border-primary ring-2 ring-primary shadow-lg" : "border-input";
    }
    // Feedback mode
    if (optionText === question.correctAnswer) { // This is the correct option
      return "border-green-500 ring-2 ring-green-500 bg-green-500/10 text-green-700 font-semibold shadow-md";
    }
    if (selectedAnswer === optionIndex && optionText !== question.correctAnswer) { // User selected this, and it's wrong
      return "border-destructive ring-2 ring-destructive bg-destructive/10 text-destructive font-semibold shadow-md";
    }
    return "border-input opacity-70"; // Other incorrect, unselected options
  };


  return (
    <div className="space-y-8 md:space-y-10 p-6 md:p-8 rounded-xl bg-card border shadow-sm">
      <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-relaxed">
        {question.questionText}
      </p>

      {question.isMultipleChoice && question.options ? (
        <RadioGroup
          value={typeof selectedAnswer === 'number' ? String(selectedAnswer) : undefined}
          onValueChange={(value) => onAnswerChange(parseInt(value))}
          disabled={disabled}
          className="space-y-4"
        >
          {question.options.map((option, index) => (
            <Label
              key={option.id}
              htmlFor={`option-${question.id}-${option.id}`}
              className={cn(
                "flex items-center space-x-3 p-5 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                getOptionClassName(option.text, index),
                disabled && showFeedback && "cursor-default hover:shadow-sm",
                disabled && !showFeedback && "opacity-70 cursor-not-allowed"
              )}
            >
              <RadioGroupItem
                value={String(index)}
                id={`option-${question.id}-${option.id}`}
                className={cn(
                    "h-6 w-6",
                    showFeedback && option.text === question.correctAnswer && "border-green-500 text-green-500",
                    showFeedback && selectedAnswer === index && option.text !== question.correctAnswer && "border-destructive text-destructive"
                )}
              />
              <span className="text-lg md:text-xl flex-1">{option.text}</span>
              {showFeedback && option.text === question.correctAnswer && (
                 <CheckCircle className="h-7 w-7 text-green-500" />
              )}
              {showFeedback && selectedAnswer === index && option.text !== question.correctAnswer && (
                <XCircle className="h-7 w-7 text-destructive" />
              )}
            </Label>
          ))}
        </RadioGroup>
      ) : (
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Type your answer here..."
            value={typeof selectedAnswer === 'string' ? selectedAnswer : ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            className={cn(
                "py-4 px-5 text-lg md:text-xl",
                showFeedback && isCorrect && "border-green-500 ring-2 ring-green-500 bg-green-500/5",
                showFeedback && isCorrect === false && "border-destructive ring-2 ring-destructive bg-destructive/5"
            )}
            aria-label="Your answer"
          />
          {showFeedback && (
            <div className={cn(
                "mt-3 p-4 rounded-md text-base md:text-lg",
                isCorrect ? "bg-green-500/10 text-green-700 border border-green-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"
            )}>
              {isCorrect ? (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6"/> Correct!
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-medium">
                        <XCircle className="h-6 w-6"/> Incorrect.
                    </div>
                    <p>The correct answer is: <span className="font-semibold">{question.correctAnswer}</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
