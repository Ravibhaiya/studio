
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Search, Plus, Edit3, Trash2, Eye } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import type { Quiz } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateQuizDialog } from "@/components/quizzes/CreateQuizDialog";
import { EditQuizDialog } from "@/components/quizzes/EditQuizDialog"; // To be created
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDistanceToNow } from 'date-fns';
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
import { useRouter } from "next/navigation";

const QuizListItem = ({ quiz, onEdit, onDelete }: { quiz: Quiz; onEdit: (quizId: string) => void; onDelete: (quizId: string) => void; }) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 ease-in-out bg-card rounded-xl border group transform hover:-translate-y-1">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
          <Link href={`/quizzes/${quiz.id}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            {quiz.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-5 pt-2">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          Last updated: {formatDistanceToNow(new Date(quiz.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 p-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
        <Button variant="default" size="sm" asChild className="flex-1 shadow-md hover:shadow-lg transition-shadow">
          {/* Placeholder for study quiz page */}
          <Link href={`/quizzes/${quiz.id}/study`}> 
            <Eye className="mr-2 h-4 w-4" /> Study Quiz
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(quiz.id)} aria-label="Edit quiz" className="text-muted-foreground hover:text-primary">
            <Edit3 className="h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" aria-label="Delete quiz">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the quiz
                  "{quiz.name}" and all its questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(quiz.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};


export default function QuizzesPage() {
  const hydrated = useHydration();
  const quizzesFromStore = useFlashyStore((state) => state.quizzes);
  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const removeQuiz = useFlashyStore((state) => state.removeQuiz);
  const router = useRouter();

  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hydrated) {
      const newFilteredQuizzes = quizzesFromStore.filter(quiz => 
        quiz.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setFilteredQuizzes(newFilteredQuizzes);
    }
  }, [hydrated, quizzesFromStore, debouncedSearchTerm]);

  const handleEditQuiz = (quizId: string) => {
    const quizToEdit = getQuiz(quizId);
    if (quizToEdit) {
      setEditingQuiz(quizToEdit);
      setIsEditModalOpen(true);
    }
  };
  
  const handleDeleteQuiz = (quizId: string) => {
    const quizToDelete = getQuiz(quizId);
    if (quizToDelete) {
      removeQuiz(quizId);
      toast({
        title: "Quiz Deleted",
        description: `Quiz "${quizToDelete.name}" has been removed.`,
        variant: "destructive",
      });
    }
  };

  const handleQuizCreated = (quizId: string) => {
    setIsCreateQuizModalOpen(false);
    router.push(`/quizzes/${quizId}`);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ClipboardList className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading your quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Quizzes</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search quizzes..." 
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateQuizModalOpen(true)} className="w-full sm:w-auto shadow-md hover:shadow-lg">
            <Plus className="mr-2 h-5 w-5" /> Create Quiz
          </Button>
        </div>
      </div>

      {quizzesFromStore.length === 0 && !debouncedSearchTerm ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-card min-h-[350px] shadow-lg">
          <ClipboardList data-ai-hint="clipboard checklist" className="mx-auto h-24 w-24 text-primary mb-8 animate-bounce" />
          <h2 className="text-3xl font-semibold text-foreground mb-3">No Quizzes Yet!</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Create your first quiz to test your knowledge or challenge others.
          </p>
          <Button size="lg" onClick={() => setIsCreateQuizModalOpen(true)} className="shadow-lg hover:shadow-xl">
            <Plus className="mr-2 h-5 w-5" /> Create First Quiz
          </Button>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card p-8 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <Search data-ai-hint="magnifying glass" className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="mt-2 text-2xl font-semibold text-foreground">No Quizzes Found</h3>
          <p className="mt-2 text-md text-muted-foreground max-w-sm">
            Your search for &quot;{debouncedSearchTerm}&quot; did not match any quizzes.
          </p>
          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-6 text-lg text-primary hover:underline">
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredQuizzes.map((quiz) => (
            <QuizListItem key={quiz.id} quiz={quiz} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} />
          ))}
        </div>
      )}

      {editingQuiz && (
        <EditQuizDialog // This component needs to be created
          quiz={editingQuiz}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingQuiz(null);
          }}
        />
      )}

      <CreateQuizDialog
        isOpen={isCreateQuizModalOpen}
        onOpenChange={setIsCreateQuizModalOpen}
        onQuizCreated={handleQuizCreated}
      />
    </div>
  );
}
