"use client";

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AppHeaderProps {
  onExport: () => void;
  leftSidebarTrigger?: React.ReactNode;
  rightSidebarTrigger?: React.ReactNode;
}

export default function AppHeader({ onExport, leftSidebarTrigger, rightSidebarTrigger }: AppHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {leftSidebarTrigger}
        <Logo className="size-8" />
        <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">Math Tools</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onExport} variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Download className="mr-2 size-4" />
          Export
        </Button>
        {rightSidebarTrigger}
      </div>
    </header>
  );
}
