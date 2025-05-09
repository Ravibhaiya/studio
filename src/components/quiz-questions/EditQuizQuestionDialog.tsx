
"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2 } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { QuizQuestion, QuizQuestionOption } from "@/lib/types";

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Option text cannot be empty."),
});

const quizQuestionFormSchema = z.object({
  questionText: z.string().min(1, "Question text is required."),
  isMultipleChoice: z.boolean(),
  options: z.array(optionSchema).optional(),
  correctAnswerText: z.string().optional(),
  correctOptionIndex: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.isMultipleChoice) {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Multiple choice questions must have at least 2 options.",
        path: ["options"],
      });
    }
    if (data.options && data.options.length > 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple choice questions can have at most 4 options.",
          path: ["options"],
        });
      }
    if (data.correctOptionIndex === undefined || data.correctOptionIndex < 0 || (data.options && data.correctOptionIndex >= data.options.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A correct option must be selected.",
        path: ["correctOptionIndex"],
      });
    }
  } else {
    if (!data.correctAnswerText || data.correctAnswerText.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct answer is required for free-text questions.",
        path: ["correctAnswerText"],
      });
    }
  }
});

type QuizQuestionFormData = z.infer<typeof quizQuestionFormSchema>;

interface EditQuizQuestionDialogProps {
  quizId: string;
  question: QuizQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onQuestionUpdated?: (question: QuizQuestion) => void;
}

export function EditQuizQuestionDialog({ quizId, question, isOpen, onClose, onQuestionUpdated }: EditQuizQuestionDialogProps) {
  const updateQuizQuestion = useFlashyStore((state) => state.updateQuizQuestion);
  const { toast } = useToast();

  const form = useForm<QuizQuestionFormData>({
    resolver: zodResolver(quizQuestionFormSchema),
    defaultValues: {
      questionText: "",
      isMultipleChoice: true,
      options: [],
      correctAnswerText: "",
      correctOptionIndex: undefined,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const isMultipleChoice = form.watch("isMultipleChoice");

  useEffect(() => {
    if (question) {
      form.reset({
        questionText: question.questionText,
        isMultipleChoice: question.isMultipleChoice,
        options: question.isMultipleChoice ? question.options?.map(opt => ({ id:opt.id, text: opt.text })) || [] : [],
        correctAnswerText: question.isMultipleChoice ? "" : question.correctAnswer,
        correctOptionIndex: question.isMultipleChoice 
          ? question.options?.findIndex(opt => opt.text === question.correctAnswer)
          : undefined,
      });
    }
  }, [question, form, isOpen]); // Re-initialize form when dialog opens or question changes

  // Effect to manage options based on isMultipleChoice, similar to Create dialog
  useEffect(() => {
    if (!isOpen) return; // Only run when dialog is open
    
    const currentIsMultipleChoice = form.getValues("isMultipleChoice");
    if (currentIsMultipleChoice) {
      form.setValue("correctAnswerText", "");
      const currentOptions = form.getValues("options");
      if (!currentOptions || currentOptions.length === 0) {
        // If switching to multiple choice and no options, add defaults
         replace([{ text: "" }, { text: "" }]);
      }
    } else {
      // replace([]); // Clears options array
      form.setValue("options", []); // Clear options field
      form.setValue("correctOptionIndex", undefined);
    }
  }, [isMultipleChoice, form, isOpen, replace]);


  const onSubmit = (data: QuizQuestionFormData) => {
    if (!question) return;

    let updatedQuestionData: Partial<Omit<QuizQuestion, 'id'>>;

    if (data.isMultipleChoice && data.options && data.correctOptionIndex !== undefined) {
      // Ensure options have IDs, reuse existing if available
      const finalOptions: QuizQuestionOption[] = data.options.map((opt, idx) => ({
        id: question.options?.[idx]?.id || opt.id || crypto.randomUUID(), // Reuse existing ID or generate new
        text: opt.text,
      }));

      updatedQuestionData = {
        questionText: data.questionText,
        isMultipleChoice: true,
        options: finalOptions,
        correctAnswer: finalOptions[data.correctOptionIndex].text,
      };
    } else if (!data.isMultipleChoice && data.correctAnswerText) {
      updatedQuestionData = {
        questionText: data.questionText,
        isMultipleChoice: false,
        options: undefined, // Clear options if not multiple choice
        correctAnswer: data.correctAnswerText,
      };
    } else {
      toast({ title: "Error", description: "Invalid question data.", variant: "destructive" });
      return;
    }
    
    updateQuizQuestion(quizId, question.id, updatedQuestionData);
    toast({
      title: "Question Updated",
      description: `Question "${data.questionText.substring(0, 30)}..." updated.`,
    });
    if (onQuestionUpdated) {
      onQuestionUpdated({ ...question, ...updatedQuestionData } as QuizQuestion);
    }
    onClose();
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quiz Question</DialogTitle>
          <DialogDescription>
            Update the details for this quiz question.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor={`edit-questionText-${question.id}`}>Question Text</Label>
            <Textarea
              id={`edit-questionText-${question.id}`}
              {...form.register("questionText")}
              className="mt-1"
              rows={3}
            />
            {form.formState.errors.questionText && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.questionText.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
             <Controller
              name="isMultipleChoice"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id={`edit-isMultipleChoice-${question.id}`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor={`edit-isMultipleChoice-${question.id}`} className="cursor-pointer">
              Multiple Choice Question
            </Label>
          </div>

          {isMultipleChoice ? (
            <div className="space-y-4 p-4 border rounded-md">
              <Label>Options (Select the correct answer)</Label>
               <Controller
                name="correctOptionIndex"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value !== undefined ? String(field.value) : undefined}
                    className="space-y-2"
                  >
                    {fields.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={String(index)} id={`edit-option-${item.id || index}-radio`} />
                        <Input
                          {...form.register(`options.${index}.text`)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-grow"
                        />
                        {fields.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {fields.length < 4 && (
                <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
              )}
              {form.formState.errors.options && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.options.message || form.formState.errors.options.root?.message}</p>
              )}
              {form.formState.errors.correctOptionIndex && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.correctOptionIndex.message}</p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor={`edit-correctAnswerText-${question.id}`}>Correct Answer</Label>
              <Input
                id={`edit-correctAnswerText-${question.id}`}
                {...form.register("correctAnswerText")}
                className="mt-1"
              />
              {form.formState.errors.correctAnswerText && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.correctAnswerText.message}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
