"use client";

import { PromptHistoryItem } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface HistoryPanelProps {
  history: PromptHistoryItem[];
  onSelectItem: (id: string | null) => void;
}

export default function HistoryPanel({ history, onSelectItem }: HistoryPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-16 flex-shrink-0 border-b px-4 flex items-center">
        <h2 className="font-headline text-lg font-semibold">History</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-2">
           {history.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">Prompt history will appear here.</p>
          )}
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="group flex gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={item.thumbnailUrl} alt={item.prompt} fill style={{ objectFit: 'cover' }} />
              </div>
              <p className="font-code text-xs text-muted-foreground self-center">{item.prompt}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
