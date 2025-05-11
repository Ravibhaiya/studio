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
import { Checkbox } from "@/components/ui/checkbox";
import useFlashyStore from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const quizSchema = z.object({
  name: z.string().min(1, "Quiz name is required").max(100, "Quiz name is too long"),
  timerEnabled: z.boolean().optional(),
  timerDurationSeconds: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : undefined),
    z.number({invalid_type_error: "Duration must be a number."})
      .positive("Duration must be positive.")
      .int("Duration must be a whole number.")
      .min(10, "Minimum duration is 10 seconds.") 
      .max(3600, "Maximum duration is 3600 seconds (1 hour).") 
      .optional()
  ),
}).refine(data => !data.timerEnabled || (data.timerEnabled && data.timerDurationSeconds !== undefined), {
  message: "Timer duration is required when timer is enabled.",
  path: ["timerDurationSeconds"],
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
      timerEnabled: false,
      timerDurationSeconds: 300, // Default to 300 seconds (5 minutes)
    },
  });

  const timerEnabled = form.watch("timerEnabled");

  const onSubmit = (data: QuizFormData) => {
    const newQuiz = addQuiz(data.name, data.timerEnabled, data.timerDurationSeconds);
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Enter a name and timer settings for your new quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="space-y-3 p-4 border rounded-md">
            <div className="flex items-center space-x-2">
               <Checkbox
                id="timerEnabled"
                checked={form.watch('timerEnabled')}
                onCheckedChange={(checked) => form.setValue('timerEnabled', Boolean(checked))}
              />
              <Label htmlFor="timerEnabled" className="cursor-pointer">
                Enable Timer
              </Label>
            </div>

            {timerEnabled && (
              <div>
                <Label htmlFor="timerDurationSeconds">Timer Duration per Question (seconds)</Label>
                <Input
                  id="timerDurationSeconds"
                  type="number"
                  {...form.register("timerDurationSeconds")}
                  placeholder="e.g., 60"
                  className="mt-1"
                />
                {form.formState.errors.timerDurationSeconds && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.timerDurationSeconds.message}</p>
                )}
              </div>
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