"use client";

import { CanvasItem } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  items: CanvasItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onDeleteItem: (id:string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

export default function LayersPanel({ items, selectedItemId, onSelectItem, onDeleteItem, onToggleVisibility, onMoveLayer }: LayersPanelProps) {
  const sortedItems = [...items].sort((a, b) => b.zIndex - a.zIndex);
  
  return (
    <div className="flex h-full flex-col">
      <div className="h-16 flex-shrink-0 border-b px-4 flex items-center">
        <h2 className="font-headline text-lg font-semibold">Layers</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {sortedItems.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No layers yet. Click on the canvas to start generating.</p>
          )}
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={cn(
                "group flex items-center gap-2 rounded-md p-2 cursor-pointer transition-colors hover:bg-secondary",
                selectedItemId === item.id && "bg-secondary"
              )}
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                <Image src={item.imageUrl} alt={item.prompt} fill style={{ objectFit: 'cover' }} />
              </div>
              <p className="flex-grow text-sm truncate" title={item.prompt}>{item.prompt}</p>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); onMoveLayer(item.id, 'up') }} disabled={index === 0}>
                  <ArrowUp className="size-4"/>
                </Button>
                 <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); onMoveLayer(item.id, 'down') }} disabled={index === sortedItems.length - 1}>
                  <ArrowDown className="size-4"/>
                </Button>
                 <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); onToggleVisibility(item.id, !item.visible) }}>
                  {item.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id) }}>
                  <Trash2 className="size-4"/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
