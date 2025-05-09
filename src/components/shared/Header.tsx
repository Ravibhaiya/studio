
"use client";

import Link from "next/link";
import { Zap } from "lucide-react"; 

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Flashy</span>
        </Link>
        <nav className="flex items-center space-x-6">
          {/* Dashboard link removed */}
        </nav>
      </div>
    </header>
  );
}

