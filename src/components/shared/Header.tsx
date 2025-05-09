
"use client";

import Link from "next/link";
import { Zap, BookOpenText, ClipboardList } from "lucide-react"; 

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Flashy</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
            <BookOpenText className="mr-1.5 h-4 w-4" /> Decks
          </Link>
          <Link href="/quizzes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
            <ClipboardList className="mr-1.5 h-4 w-4" /> Quizzes
          </Link>
        </nav>
      </div>
    </header>
  );
}
