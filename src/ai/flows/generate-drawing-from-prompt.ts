// src/ai/flows/generate-drawing-from-prompt.ts
'use server';
/**
 * @fileOverview Generates a drawing based on a text prompt and places it on the canvas at a specified location.
 *
 * - generateDrawingFromPrompt - A function that generates a drawing from a prompt and location.
 * - GenerateDrawingFromPromptInput - The input type for the generateDrawingFromPrompt function.
 * - GenerateDrawingFromPromptOutput - The return type for the generateDrawingFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDrawingFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the drawing from.'),
  x: z.number().describe('The x coordinate of the canvas to place the drawing at.'),
  y: z.number().describe('The y coordinate of the canvas to place the drawing at.'),
});
export type GenerateDrawingFromPromptInput = z.infer<
  typeof GenerateDrawingFromPromptInputSchema
>;

const GenerateDrawingFromPromptOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type GenerateDrawingFromPromptOutput = z.infer<
  typeof GenerateDrawingFromPromptOutputSchema
>;

export async function generateDrawingFromPrompt(
  input: GenerateDrawingFromPromptInput
): Promise<GenerateDrawingFromPromptOutput> {
  return generateDrawingFromPromptFlow(input);
}

const generateDrawingFromPromptPrompt = ai.definePrompt({
  name: 'generateDrawingFromPromptPrompt',
  input: {schema: GenerateDrawingFromPromptInputSchema},
  output: {schema: GenerateDrawingFromPromptOutputSchema},
  prompt: `Generate an image based on the following prompt:

Prompt: {{{prompt}}}

The image should be a drawing that can be placed on a canvas at the specified coordinates.
Return only a URL of the generated image.`,
});

const generateDrawingFromPromptFlow = ai.defineFlow(
  {
    name: 'generateDrawingFromPromptFlow',
    inputSchema: GenerateDrawingFromPromptInputSchema,
    outputSchema: GenerateDrawingFromPromptOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });

    return {imageUrl: media.url!};
  }
);
