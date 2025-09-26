"use client";

import { ActivePrompt, CanvasItem } from "@/lib/types";
import CanvasItemComponent from "./canvas-item";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasAreaProps {
  items: CanvasItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  isGenerating: boolean;
  activePrompt: ActivePrompt | null;
  onActivePromptChange: (pos: ActivePrompt | null) => void;
  onGenerate: (prompt: string, position: { x: number, y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: "Prompt must be at least 2 characters.",
  }),
});

export default function CanvasArea({
  items,
  selectedItemId,
  onSelectItem,
  updateItem,
  isGenerating,
  activePrompt,
  onActivePromptChange,
  onGenerate,
  canvasRef
}: CanvasAreaProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (activePrompt) return;
    onSelectItem(null);
    const rect = e.currentTarget.getBoundingClientRect();
    onActivePromptChange({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    form.reset();
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (activePrompt) {
      onGenerate(values.prompt, activePrompt);
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-hidden cursor-crosshair bg-background"
      onClick={handleCanvasClick}
    >
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white_0,white_100,transparent_100)] dark:bg-grid-slate-700/40"></div>
      
      {items.map((item) => (
        item.visible && <CanvasItemComponent
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          onSelect={onSelectItem}
          onUpdate={updateItem}
          canvasRef={canvasRef}
        />
      ))}
      
      <Popover open={!!activePrompt} onOpenChange={(open) => !open && onActivePromptChange(null)}>
        <PopoverAnchor style={{ position: 'absolute', top: activePrompt?.y, left: activePrompt?.x }} />
        <PopoverContent className="w-80">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder="e.g., a curious cat" {...field} autoFocus />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isGenerating}>
                {isGenerating ? <Loader className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Generate
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>

      {isGenerating && !activePrompt && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
          <Loader className="animate-spin" />
          Generating your masterpiece...
        </div>
      )}

      <style jsx>{`
        .bg-grid-slate-200 {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="rgba(203, 213, 225, 0.5)"><rect width="100%" height="100%"/></svg>');
        }
        .dark .bg-grid-slate-700\\/40 {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="rgba(71, 85, 105, 0.4)"><rect width="100%" height="100%"/></svg>');
        }
      `}</style>
    </div>
  );
}
