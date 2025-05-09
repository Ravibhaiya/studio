
"use client";

import React from "react";
import { Edit3, Trash2, CheckCircle, List } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestionListItemProps {
  quizId: string;
  question: QuizQuestion;
  onEdit: (question: QuizQuestion) => void;
}

export const QuizQuestionListItem = ({ quizId, question, onEdit }: QuizQuestionListItemProps) => {
  const removeQuizQuestion = useFlashyStore((state) => state.removeQuizQuestion);
  const { toast } = useToast();

  const handleDelete = () => {
    removeQuizQuestion(quizId, question.id);
    toast({
      title: "Question Deleted",
      description: `Question "${question.questionText.substring(0,30)}..." has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-card rounded-lg border group">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {question.questionText}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {question.isMultipleChoice && question.options && question.options.length > 0 ? (
          <div className="space-y-1.5 mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Options:</p>
            <ul className="list-disc list-inside pl-1 space-y-1">
              {question.options.map((opt) => (
                <li key={opt.id} className={`text-sm ${opt.text === question.correctAnswer ? 'font-semibold text-primary' : 'text-foreground'}`}>
                  {opt.text}
                  {opt.text === question.correctAnswer && <CheckCircle className="inline-block ml-1.5 h-3.5 w-3.5 text-green-600" />}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Answer:</p>
            <p className="text-sm font-semibold text-primary">{question.correctAnswer}</p>
          </div>
        )}
         <Badge variant={question.isMultipleChoice ? "secondary" : "outline"} className="mt-3 text-xs">
            {question.isMultipleChoice ? "Multiple Choice" : "Free Text"}
        </Badge>
      </CardContent>
      <CardFooter className="p-3 pt-2 flex justify-end gap-2 mt-auto border-t bg-muted/20">
        <Button variant="ghost" size="sm" onClick={() => onEdit(question)} aria-label="Edit question" className="text-muted-foreground hover:text-primary">
          <Edit3 className="mr-1.5 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete question">
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this question.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
