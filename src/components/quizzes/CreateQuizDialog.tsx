
"use client";

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

const quizSchema = z.object({
  name: z.string().min(1, "Quiz name is required").max(100, "Quiz name is too long"),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface CreateQuizDialogProps {
  onQuizCreated?: (quizId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuizDialog({ onQuizCreated, isOpen, onOpenChange }: CreateQuizDialogProps) {
  const addQuiz = useFlashyStore((state) => state.addQuiz);
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: QuizFormData) => {
    const newQuiz = addQuiz(data.name);
    toast({
      title: "Quiz Created",
      description: `Quiz "${newQuiz.name}" has been successfully created.`,
    });
    form.reset();
    onOpenChange(false);
    if (onQuizCreated) {
      onQuizCreated(newQuiz.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Enter a name for your new quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quiz-name">Quiz Name</Label>
            <Input
              id="quiz-name"
              {...form.register("name")}
              placeholder="e.g., General Knowledge"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
