export type CanvasItem = {
  id: string;
  prompt: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
};

export type PromptHistoryItem = {
  id: string;
  prompt: string;
  thumbnailUrl: string;
};

export type ActivePrompt = {
  x: number;
  y: number;
};
