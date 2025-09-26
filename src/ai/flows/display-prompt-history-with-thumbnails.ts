'use server';

/**
 * @fileOverview Flow to display a history of prompts with thumbnails.
 *
 * - displayPromptHistoryWithThumbnails - A function that retrieves and formats the prompt history with thumbnails.
 * - DisplayPromptHistoryWithThumbnailsInput - The input type for the displayPromptHistoryWithThumbnails function.
 * - DisplayPromptHistoryWithThumbnailsOutput - The return type for the displayPromptHistoryWithThumbnails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayPromptHistoryWithThumbnailsInputSchema = z.object({
  promptHistory: z.array(
    z.object({
      prompt: z.string(),
      thumbnailDataUri: z.string().optional(),
    })
  ).
describe('An array of prompt history items, each containing a prompt string and an optional thumbnail data URI.'),
});

export type DisplayPromptHistoryWithThumbnailsInput = z.infer<typeof DisplayPromptHistoryWithThumbnailsInputSchema>;

const DisplayPromptHistoryWithThumbnailsOutputSchema = z.array(
  z.object({
    prompt: z.string(),
    thumbnailDataUri: z.string().optional(),
  })
).
describe('An array of prompt history items, each containing a prompt string and an optional thumbnail data URI.');

export type DisplayPromptHistoryWithThumbnailsOutput = z.infer<typeof DisplayPromptHistoryWithThumbnailsOutputSchema>;

export async function displayPromptHistoryWithThumbnails(
  input: DisplayPromptHistoryWithThumbnailsInput
): Promise<DisplayPromptHistoryWithThumbnailsOutput> {
  return displayPromptHistoryWithThumbnailsFlow(input);
}

const displayPromptHistoryWithThumbnailsFlow = ai.defineFlow(
  {
    name: 'displayPromptHistoryWithThumbnailsFlow',
    inputSchema: DisplayPromptHistoryWithThumbnailsInputSchema,
    outputSchema: DisplayPromptHistoryWithThumbnailsOutputSchema,
  },
  async input => {
    // Simply return the input as is, since the formatting is already expected.
    return input.promptHistory;
  }
);
