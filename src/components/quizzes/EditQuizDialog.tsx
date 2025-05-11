"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Quiz } from "@/lib/types";

const quizSchema = z.object({
  name: z.string().min(1, "Quiz name is required").max(100, "Quiz name is too long"),
  timerEnabled: z.boolean().optional(),
  timerDurationMinutes: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : undefined),
     z.number({invalid_type_error: "Duration must be a number."})
      .positive("Duration must be positive.")
      .int("Duration must be a whole number.")
      .min(1, "Minimum duration is 1 minute.")
      .optional()
  ),
}).refine(data => !data.timerEnabled || (data.timerEnabled && data.timerDurationMinutes !== undefined), {
  message: "Timer duration is required when timer is enabled.",
  path: ["timerDurationMinutes"],
});

type QuizFormData = z.infer<typeof quizSchema>;

interface EditQuizDialogProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onQuizUpdated?: (quizId: string) => void;
}

export function EditQuizDialog({ quiz, isOpen, onClose, onQuizUpdated }: EditQuizDialogProps) {
  const updateQuiz = useFlashyStore((state) => state.updateQuiz);
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      name: "",
      timerEnabled: false,
      timerDurationMinutes: 5,
    },
  });
  
  const timerEnabled = form.watch("timerEnabled");

  useEffect(() => {
    if (quiz) {
      form.reset({
        name: quiz.name,
        timerEnabled: quiz.timerEnabled ?? false,
        timerDurationMinutes: quiz.timerDuration ? quiz.timerDuration / 60 : 5,
      });
    }
  }, [quiz, form, isOpen]);

  const onSubmit = (data: QuizFormData) => {
    if (!quiz) return;

    const timerDurationInSeconds = data.timerEnabled && data.timerDurationMinutes 
      ? data.timerDurationMinutes * 60 
      : quiz.timerDuration; // Keep existing if not enabled or no new value

    updateQuiz(quiz.id, { 
      name: data.name,
      timerEnabled: data.timerEnabled,
      timerDuration: data.timerEnabled ? timerDurationInSeconds : undefined, // store undefined if not enabled
    });
    toast({
      title: "Quiz Updated",
      description: `Quiz "${data.name}" has been successfully updated.`,
    });
    // form.reset(); // Don't reset here, useEffect handles it based on isOpen
    onClose();
    if (onQuizUpdated) {
      onQuizUpdated(quiz.id);
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {if (!open) onClose()}}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Update the name and timer settings for your quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="edit-quiz-name">Quiz Name</Label>
            <Input
              id="edit-quiz-name"
              {...form.register("name")}
              placeholder="e.g., General Knowledge"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`edit-timerEnabled-${quiz.id}`}
                checked={form.watch('timerEnabled')}
                onCheckedChange={(checked) => form.setValue('timerEnabled', Boolean(checked))}
              />
              <Label htmlFor={`edit-timerEnabled-${quiz.id}`} className="cursor-pointer">
                Enable Timer
              </Label>
            </div>

            {timerEnabled && (
              <div>
                <Label htmlFor={`edit-timerDurationMinutes-${quiz.id}`}>Timer Duration (minutes)</Label>
                <Input
                  id={`edit-timerDurationMinutes-${quiz.id}`}
                  type="number"
                  {...form.register("timerDurationMinutes")}
                  placeholder="e.g., 10"
                  className="mt-1"
                />
                {form.formState.errors.timerDurationMinutes && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.timerDurationMinutes.message}</p>
                )}
              </div>
            )}
          </div>

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