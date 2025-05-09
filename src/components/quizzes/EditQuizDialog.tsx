
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
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Quiz } from "@/lib/types";

const quizSchema = z.object({
  name: z.string().min(1, "Quiz name is required").max(100, "Quiz name is too long"),
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
    },
  });

  useEffect(() => {
    if (quiz) {
      form.reset({
        name: quiz.name,
      });
    }
  }, [quiz, form]);

  const onSubmit = (data: QuizFormData) => {
    if (!quiz) return;

    updateQuiz(quiz.id, { name: data.name });
    toast({
      title: "Quiz Updated",
      description: `Quiz "${data.name}" has been successfully updated.`,
    });
    form.reset();
    onClose();
    if (onQuizUpdated) {
      onQuizUpdated(quiz.id);
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Update the name for your quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
