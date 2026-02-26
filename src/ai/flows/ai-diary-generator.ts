
'use server';
/**
 * @fileOverview A Genkit flow for generating daily dynamic English learning content.
 * Handles diverse categories like News, Trends, and Memes for Malaysian students.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiDiaryGeneratorInputSchema = z.object({
  examType: z.enum(['SPM', 'MUET']).describe('The target exam level.'),
  category: z.enum(['News', 'Trend', 'Meme', 'Story']).optional().describe('The type of content to generate.'),
});
export type AiDiaryGeneratorInput = z.infer<typeof AiDiaryGeneratorInputSchema>;

const AiDiaryGeneratorOutputSchema = z.object({
  title: z.string().describe('Engaging title for the entry.'),
  content: z.string().describe('The main text body (approx 150-200 words).'),
  author: z.string().describe('A creative author name or source.'),
  category: z.string().describe('The category of the content.'),
  vocabulary: z.array(z.string()).describe('5 key vocabulary words from the text.'),
  imageHint: z.string().describe('A 2-word hint for searching a background image.'),
});
export type AiDiaryGeneratorOutput = z.infer<typeof AiDiaryGeneratorOutputSchema>;

export async function aiDiaryGenerator(input: AiDiaryGeneratorInput): Promise<AiDiaryGeneratorOutput> {
  return aiDiaryGeneratorFlow(input);
}

const aiDiaryGeneratorPrompt = ai.definePrompt({
  name: 'aiDiaryGeneratorPrompt',
  input: { schema: AiDiaryGeneratorInputSchema },
  output: { schema: AiDiaryGeneratorOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are a dynamic content creator for Malaysian English students preparing for {{{examType}}}.
  
  Generate a today's "Diary Entry" which could be a bite-sized news piece, a viral trend explanation, a popular meme breakdown (focusing on language), or a short podcast-style script.
  
  Content should be:
  1. Relevant to Malaysian youth or global trends.
  2. Educational, using level-appropriate vocabulary for {{{examType}}}.
  3. Engaging and written in a "modern diary" style.
  
  If the category is "Meme", explain the linguistic context or slang used in the meme.
  If the category is "News", pick a real-world event but simplify it for learners.
  
  Target Exam: {{{examType}}}
  Requested Category: {{{category}}}`,
});

const aiDiaryGeneratorFlow = ai.defineFlow(
  {
    name: 'aiDiaryGeneratorFlow',
    inputSchema: AiDiaryGeneratorInputSchema,
    outputSchema: AiDiaryGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await aiDiaryGeneratorPrompt(input);
      if (!output) {
        throw new Error('AI failed to generate diary content.');
      }
      return output;
    } catch (e: any) {
      console.error('Diary Generation Error:', e);
      throw e;
    }
  }
);
