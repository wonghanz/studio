
'use server';
/**
 * @fileOverview A Genkit flow for generating reading comprehension questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiReadingComprehensionInputSchema = z.object({
  storyText: z.string().describe('The story text to generate questions for.'),
  examType: z.enum(['SPM', 'MUET']).describe('The target exam level.'),
});
export type AiReadingComprehensionInput = z.infer<typeof AiReadingComprehensionInputSchema>;

const AiReadingComprehensionOutputSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    explanation: z.string(),
  })).describe('A list of reading comprehension questions.'),
});
export type AiReadingComprehensionOutput = z.infer<typeof AiReadingComprehensionOutputSchema>;

export async function aiReadingComprehension(input: AiReadingComprehensionInput): Promise<AiReadingComprehensionOutput> {
  return aiReadingComprehensionFlow(input);
}

const aiReadingComprehensionPrompt = ai.definePrompt({
  name: 'aiReadingComprehensionPrompt',
  input: { schema: AiReadingComprehensionInputSchema },
  output: { schema: AiReadingComprehensionOutputSchema },
  prompt: `You are an expert English teacher. Based on the following story, generate 5 challenging multiple-choice reading comprehension questions suitable for a {{{examType}}} level student.

Story:
{{{storyText}}}

For each question, provide 4 options, the correct answer, and a short explanation.`,
});

const aiReadingComprehensionFlow = ai.defineFlow(
  {
    name: 'aiReadingComprehensionFlow',
    inputSchema: AiReadingComprehensionInputSchema,
    outputSchema: AiReadingComprehensionOutputSchema,
  },
  async (input) => {
    const { output } = await aiReadingComprehensionPrompt(input);
    return output!;
  }
);
