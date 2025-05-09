
"use client";

import React, { useState, useEffect, use } from "react";
import { BookOpenText, Search, Plus, FilePlus2, ClipboardList, Layers } from "lucide-react";
import useFlashyStore from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { CreateDeckDialog } from "@/components/decks/CreateDeckDialog";
import { EditDeckDialog } from "@/components/decks/EditDeckDialog";
import { CreateQuizDialog } from "@/components/quizzes/CreateQuizDialog";
import { EditQuizDialog } from "@/components/quizzes/EditQuizDialog";
import { UnifiedListItem } from "@/components/shared/UnifiedListItem";
import type { Deck, Quiz, UnifiedItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";


export default function HomePage() {
  const hydrated = useHydration();
  const decksFromStore = useFlashyStore((state) => state.decks);
  const quizzesFromStore = useFlashyStore((state) => state.quizzes);
  const getDeck = useFlashyStore((state) => state.getDeck);
  const getQuiz = useFlashyStore((state) => state.getQuiz);
  const removeDeck = useFlashyStore((state) => state.removeDeck);
  const removeQuiz = useFlashyStore((state) => state.removeQuiz);
  const router = useRouter();
  
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [allItems, setAllItems] = useState<UnifiedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<UnifiedItem[]>([]);

  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hydrated) {
      const combined: UnifiedItem[] = [
        ...decksFromStore.map((deck): UnifiedItem => ({ type: 'deck', data: deck })),
        ...quizzesFromStore.map((quiz): UnifiedItem => ({ type: 'quiz', data: quiz })),
      ];
      combined.sort((a, b) => new Date(b.data.updatedAt).getTime() - new Date(a.data.updatedAt).getTime());
      setAllItems(combined);
    }
  }, [hydrated, decksFromStore, quizzesFromStore]);

  useEffect(() => {
    if (hydrated) {
      const newFilteredItems = allItems.filter(item => 
        item.data.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredItems(newFilteredItems);
    }
  }, [hydrated, allItems, debouncedSearchTerm]);


  const handleEditItem = (itemType: 'deck' | 'quiz', itemId: string) => {
    if (itemType === 'deck') {
      const deckToEdit = getDeck(itemId);
      if (deckToEdit) {
        setEditingDeck(deckToEdit);
        setIsEditDeckModalOpen(true);
      }
    } else {
      const quizToEdit = getQuiz(itemId);
      if (quizToEdit) {
        setEditingQuiz(quizToEdit);
        setIsEditQuizModalOpen(true);
      }
    }
  };

  const handleDeckCreated = (deckId: string) => {
    setIsCreateDeckModalOpen(false); 
    router.push(`/decks/${deckId}`);
  };

  const handleQuizCreated = (quizId: string) => {
    setIsCreateQuizModalOpen(false);
    router.push(`/quizzes/${quizId}`);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Layers className="w-20 h-20 text-primary animate-pulse" />
        <p className="mt-6 text-xl text-muted-foreground">Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Study Items</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search items..." 
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border-2 border-input focus:border-primary transition-colors duration-300 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {allItems.length === 0 && !debouncedSearchTerm ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-card min-h-[350px] shadow-lg">
          <Layers data-ai-hint="layers stack" className="mx-auto h-24 w-24 text-primary mb-8 animate-bounce" />
          <h2 className="text-3xl font-semibold text-foreground mb-3">Welcome to Flashy!</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            It looks like you don&apos;t have any study items yet. Create a deck or quiz to start your learning journey.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card p-8 shadow-lg min-h-[300px] flex flex-col justify-center items-center">
          <Search data-ai-hint="magnifying glass" className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="mt-2 text-2xl font-semibold text-foreground">No Items Found</h3>
          <p className="mt-2 text-md text-muted-foreground max-w-sm">
            Your search for &quot;{debouncedSearchTerm}&quot; did not match any decks or quizzes. Try a different term or clear the search.
          </p>
          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-6 text-lg text-primary hover:underline">
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <UnifiedListItem key={item.data.id} item={item} onEdit={handleEditItem} />
          ))}
        </div>
      )}

      {editingDeck && (
        <EditDeckDialog
          deck={editingDeck}
          isOpen={isEditDeckModalOpen}
          onClose={() => {
            setIsEditDeckModalOpen(false);
            setEditingDeck(null);
          }}
        />
      )}
      
      {editingQuiz && (
        <EditQuizDialog
          quiz={editingQuiz}
          isOpen={isEditQuizModalOpen}
          onClose={() => {
            setIsEditQuizModalOpen(false);
            setEditingQuiz(null);
          }}
        />
      )}


      <div className="fixed bottom-8 right-8 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="rounded-lg w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Actions Menu"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={() => setIsCreateDeckModalOpen(true)}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              <span>Create New Deck</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsCreateQuizModalOpen(true)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>Create New Quiz</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateDeckDialog
        isOpen={isCreateDeckModalOpen}
        onOpenChange={setIsCreateDeckModalOpen}
        onDeckCreated={handleDeckCreated}
      />
      <CreateQuizDialog
        isOpen={isCreateQuizModalOpen}
        onOpenChange={setIsCreateQuizModalOpen}
        onQuizCreated={handleQuizCreated}
      />
    </div>
  );
}
