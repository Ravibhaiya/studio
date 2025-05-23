
"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, PlusCircle, Search, Info, FileText, Timer, History as HistoryIcon } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateQuizQuestionDialog } from "@/components/quiz-questions/CreateQuizQuestionDialog";
import { EditQuizQuestionDialog } from "@/components/quiz-questions/EditQuizQuestionDialog";
import { QuizQuestionListItem } from "@/components/quiz-questions/QuizQuestionListItem";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/utils";

export default function QuizDetailPage() {
  const hydrated = useHydration();
  const paramsResult = useParams();
  // For client components, useParams directly gives the object.
  const params = paramsResult; 
  const router = useRouter();
  const quizId = params.quizId as string;

  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const allQuizzes = useFlashyStore((state) => state.quizzes); 
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);

  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (hydrated && quizId) {
      const foundQuiz = getQuiz(quizId);
      setQuiz(foundQuiz || null);
    }
  }, [hydrated, quizId, getQuiz, allQuizzes]); 
  
  useEffect(() => {
    if (quiz) {
      const newFilteredQuestions = quiz.questions.filter(q =>
        q.questionText.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).sort((a,b) => a.questionText.localeCompare(b.questionText));
      setFilteredQuestions(newFilteredQuestions);
    } else {
      setFilteredQuestions([]);
    }
  }, [quiz, debouncedSearchTerm]);

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setIsEditQuestionModalOpen(true);
  };
  
  if (!hydrated || quiz === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ClipboardList className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading quiz details...</p>
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
        <ClipboardList className="w-24 h-24 text-destructive mb-6" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Quiz Not Found</p>
        <p className="text-md text-muted-foreground max-w-md">
          The quiz you are looking for might have been removed or never existed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Items
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-6 pb-6 border-b flex justify-between items-center">
         <div>
          <Button variant="outline" size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to My Items
            </Link>
          </Button>
        </div>
      </div>

      <Collapsible
        open={isQuestionsOpen}
        onOpenChange={setIsQuestionsOpen}
        className="w-full"
      >
        <Card className="shadow-xl rounded-xl overflow-hidden bg-card">
          <CardHeader className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-3 text-3xl font-extrabold text-foreground hover:text-primary transition-colors">
                      {quiz.name}
                    </button>
                </CollapsibleTrigger>
                 <div className="ml-0 mt-2">
                    <p className="text-base text-muted-foreground">
                        <span className="font-semibold text-foreground">{quiz.questions.length}</span> question{quiz.questions.length !== 1 ? "s" : ""} total
                    </p>
                    {quiz.timerEnabled && quiz.timerDuration && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Timer className="h-4 w-4 text-primary" />
                            <span>{quiz.timerDuration}s per question ({formatTime(quiz.timerDuration)})</span>
                        </p>
                    )}
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-lg items-center">
                  <div className="relative flex-grow w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      type="search" 
                      placeholder="Search questions..." 
                      className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  </div>
                   <Button asChild variant="outline" size="default" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Link href={`/quizzes/${quiz.id}/history`}>
                        <HistoryIcon className="mr-2 h-5 w-5" />
                        View History
                    </Link>
                    </Button>
                  <CreateQuizQuestionDialog
                      quizId={quiz.id} 
                      triggerButton={
                          <Button size="default" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-300">
                              <PlusCircle className="mr-2 h-5 w-5" /> Add Question
                          </Button>
                      }
                  />
              </div>
            </div>
            
            {quiz.questions.length === 0 && !debouncedSearchTerm && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl text-center flex items-center justify-center gap-3 shadow-sm">
                <Info className="h-6 w-6 text-primary shrink-0" />
                <span className="text-primary font-semibold text-base">This quiz is empty. Add some questions to start building it!</span>
              </div>
            )}
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-6">
            {quiz.questions.length === 0 && !debouncedSearchTerm ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 min-h-[300px] shadow-inner">
                <FileText data-ai-hint="document empty" className="mx-auto h-20 w-20 text-primary mb-6 opacity-70 animate-bounce" />
                <h2 className="text-2xl font-semibold text-foreground mb-3">This Quiz is Blank</h2>
                <p className="text-md text-muted-foreground mb-6 max-w-md">
                  No questions here yet. Add your first one to populate this quiz!
                </p>
                 <CreateQuizQuestionDialog
                    quizId={quiz.id}
                    triggerButton={
                        <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                            <PlusCircle className="mr-2 h-5 w-5" /> Add First Question
                        </Button>
                    }
                />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted/50 rounded-xl bg-card p-8 shadow-inner min-h-[250px] flex flex-col justify-center items-center">
                <Search data-ai-hint="magnifying glass" className="mx-auto h-16 w-16 text-muted-foreground mb-5 opacity-70" />
                <h3 className="mt-2 text-xl font-semibold text-foreground">No Questions Found</h3>
                <p className="mt-1 text-md text-muted-foreground max-w-sm">
                  Your search for &quot;{debouncedSearchTerm}&quot; did not uncover any questions. Try a different keyword or clear your search.
                </p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-5 text-md text-primary hover:underline">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <QuizQuestionListItem
                    key={question.id}
                    quizId={quiz.id}
                    question={question}
                    onEdit={handleEditQuestion}
                  />
                ))}
              </div>
            )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {editingQuestion && (
        <EditQuizQuestionDialog
          quizId={quiz.id}
          question={editingQuestion}
          isOpen={isEditQuestionModalOpen}
          onClose={() => {
            setIsEditQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}

