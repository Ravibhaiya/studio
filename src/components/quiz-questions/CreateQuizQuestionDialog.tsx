
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
  DialogTrigger,
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
  id: z.string().optional(), // for existing options during edit
  text: z.string().min(1, "Option text cannot be empty."),
});

const quizQuestionFormSchema = z.object({
  questionText: z.string().min(1, "Question text is required."),
  isMultipleChoice: z.boolean(),
  options: z.array(optionSchema).optional(),
  correctAnswerText: z.string().optional(), // For free text answer
  correctOptionIndex: z.number().optional(), // For multiple choice
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

interface CreateQuizQuestionDialogProps {
  quizId: string;
  onQuestionCreated?: (question: QuizQuestion) => void;
  triggerButton?: React.ReactNode;
}

export function CreateQuizQuestionDialog({ quizId, onQuestionCreated, triggerButton }: CreateQuizQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const addQuizQuestion = useFlashyStore((state) => state.addQuizQuestion);
  const { toast } = useToast();

  const form = useForm<QuizQuestionFormData>({
    resolver: zodResolver(quizQuestionFormSchema),
    defaultValues: {
      questionText: "",
      isMultipleChoice: true,
      options: [{ text: "" }, { text: "" }],
      correctAnswerText: "",
      correctOptionIndex: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const isMultipleChoice = form.watch("isMultipleChoice");

  useEffect(() => {
    // Reset parts of the form when isMultipleChoice changes
    if (isMultipleChoice) {
      form.setValue("correctAnswerText", "");
      if (form.getValues("options")?.length === 0) {
        form.setValue("options", [{ text: "" }, { text: "" }]);
      }
    } else {
      form.setValue("options", []);
      form.setValue("correctOptionIndex", undefined);
    }
  }, [isMultipleChoice, form]);

  const onSubmit = (data: QuizQuestionFormData) => {
    let questionToSave: Omit<QuizQuestion, 'id'>;

    if (data.isMultipleChoice && data.options && data.correctOptionIndex !== undefined) {
      const optionsWithIds: QuizQuestionOption[] = data.options.map(opt => ({ id: crypto.randomUUID(), text: opt.text }));
      questionToSave = {
        questionText: data.questionText,
        isMultipleChoice: true,
        options: optionsWithIds,
        correctAnswer: optionsWithIds[data.correctOptionIndex].text,
      };
    } else if (!data.isMultipleChoice && data.correctAnswerText) {
      questionToSave = {
        questionText: data.questionText,
        isMultipleChoice: false,
        correctAnswer: data.correctAnswerText,
      };
    } else {
      // Should not happen due to validation, but as a fallback
      toast({ title: "Error", description: "Invalid question data.", variant: "destructive" });
      return;
    }

    const newQuestion = addQuizQuestion(quizId, questionToSave);
    if (newQuestion) {
      toast({
        title: "Question Added",
        description: `Question "${newQuestion.questionText.substring(0, 30)}..." added.`,
      });
      form.reset({
        questionText: "",
        isMultipleChoice: true,
        options: [{ text: "" }, { text: "" }],
        correctAnswerText: "",
        correctOptionIndex: undefined,
      });
      setOpen(false);
      if (onQuestionCreated) {
        onQuestionCreated(newQuestion);
      }
    } else {
      toast({ title: "Error", description: "Failed to add question.", variant: "destructive" });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset({
        questionText: "",
        isMultipleChoice: true,
        options: [{ text: "" }, { text: "" }],
        correctAnswerText: "",
        correctOptionIndex: undefined,
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Quiz Question</DialogTitle>
          <DialogDescription>
            Fill in the details for your new quiz question.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              {...form.register("questionText")}
              placeholder="e.g., What is the capital of France?"
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
                  id="isMultipleChoice"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isMultipleChoice" className="cursor-pointer">
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
                        <RadioGroupItem value={String(index)} id={`option-${index}-radio`} />
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
              <Label htmlFor="correctAnswerText">Correct Answer</Label>
              <Input
                id="correctAnswerText"
                {...form.register("correctAnswerText")}
                placeholder="Enter the correct answer"
                className="mt-1"
              />
              {form.formState.errors.correctAnswerText && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.correctAnswerText.message}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
