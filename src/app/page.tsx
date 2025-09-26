"use client";

import * as React from "react";
import { generateDrawingFromPrompt } from "@/ai/flows/generate-drawing-from-prompt";
import { ActivePrompt, CanvasItem, PromptHistoryItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import LayersPanel from "@/components/app/layers-panel";
import HistoryPanel from "@/components/app/history-panel";
import AppHeader from "@/components/app/header";
import CanvasArea from "@/components/app/canvas-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { History, Layers, PanelLeft, PanelRight } from "lucide-react";

export default function Home() {
  const [items, setItems] = React.useState<CanvasItem[]>([]);
  const [history, setHistory] = React.useState<PromptHistoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activePrompt, setActivePrompt] = React.useState<ActivePrompt | null>(null);
  
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = React.useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const handleGenerate = async (prompt: string, position: { x: number; y: number }) => {
    setIsGenerating(true);
    setActivePrompt(null);
    try {
      const result = await generateDrawingFromPrompt({ prompt, ...position });
      const newId = `item-${Date.now()}`;
      const newItem: CanvasItem = {
        id: newId,
        prompt,
        imageUrl: result.imageUrl,
        x: position.x - 150, // Center image on click
        y: position.y - 100,
        width: 300,
        height: 200,
        rotation: 0,
        zIndex: items.length,
        visible: true,
      };
      setItems((prev) => [...prev, newItem]);
      setHistory((prev) => [{ id: newId, prompt, thumbnailUrl: result.imageUrl }, ...prev]);
      setSelectedItemId(newId);
    } catch (error) {
      console.error("Failed to generate drawing:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the drawing. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };
  
  const moveLayer = (id: string, direction: "up" | "down") => {
    setItems(prevItems => {
        const newItems = [...prevItems];
        const index = newItems.findIndex(item => item.id === id);
        if (index === -1) return newItems;

        const newIndex = direction === 'up' ? index + 1 : index - 1;

        if (newIndex < 0 || newIndex >= newItems.length) return newItems;

        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        // Update zIndex
        return newItems.map((item, idx) => ({ ...item, zIndex: idx }));
    });
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const svgWidth = canvasBounds.width;
    const svgHeight = canvasBounds.height;
    
    const itemToSvg = (item: CanvasItem) => {
      if (!item.visible) return '';
      const centerX = item.width / 2;
      const centerY = item.height / 2;
      return `<image 
        href="${item.imageUrl}" 
        x="${item.x}" y="${item.y}" 
        width="${item.width}" height="${item.height}" 
        transform="rotate(${item.rotation}, ${item.x + centerX}, ${item.y + centerY})"
      />`;
    }

    const svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Source+Code+Pro:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap');
        </style>
        ${[...items].sort((a,b) => a.zIndex - b.zIndex).map(itemToSvg).join('')}
      </svg>`;

    const blob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        <AppHeader
          onExport={handleExport}
          leftSidebarTrigger={
            <Sheet open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Layers className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <LayersPanel items={items} selectedItemId={selectedItemId} onSelectItem={setSelectedItemId} onDeleteItem={deleteItem} onToggleVisibility={(id, visible) => updateItem(id, { visible })} onMoveLayer={moveLayer} />
              </SheetContent>
            </Sheet>
          }
          rightSidebarTrigger={
             <Sheet open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><History className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <HistoryPanel history={history} onSelectItem={setSelectedItemId} />
              </SheetContent>
            </Sheet>
          }
        />
        <main className="flex-grow overflow-hidden">
            <CanvasArea
              items={items}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              updateItem={updateItem}
              isGenerating={isGenerating}
              activePrompt={activePrompt}
              onActivePromptChange={setActivePrompt}
              onGenerate={handleGenerate}
              canvasRef={canvasRef}
            />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-72 flex-shrink-0 border-r bg-card">
        <LayersPanel items={items} selectedItemId={selectedItemId} onSelectItem={setSelectedItemId} onDeleteItem={deleteItem} onToggleVisibility={(id, visible) => updateItem(id, { visible })} onMoveLayer={moveLayer} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader onExport={handleExport} />
        <main className="flex-grow overflow-hidden">
          <CanvasArea
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            updateItem={updateItem}
            isGenerating={isGenerating}
            activePrompt={activePrompt}
            onActivePromptChange={setActivePrompt}
            onGenerate={handleGenerate}
            canvasRef={canvasRef}
          />
        </main>
      </div>
      <aside className="w-72 flex-shrink-0 border-l bg-card">
        <HistoryPanel history={history} onSelectItem={setSelectedItemId} />
      </aside>
    </div>
  );
}
