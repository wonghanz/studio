
'use server';
/**
 * @fileOverview A Genkit flow for evaluating levels in the Gamified Writing Journey.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AiJourneyEvaluationInputSchema = z.object({
  storyId: z.string(),
  levelId: z.string(),
  userText: z.string().describe("The user's writing response for the current level."),
  levelTitle: z.string().describe('The title or focus of the current level (e.g., Setting the Scene).'),
  examType: z.enum(['MUET', 'SPM']).describe('The target exam rubric.'),
});
export type AiJourneyEvaluationInput = z.infer<typeof AiJourneyEvaluationInputSchema>;

const AiJourneyEvaluationOutputSchema = z.object({
  bandScore: z.string().describe('Estimated grade or band score based on official rubrics.'),
  feedback: z.string().describe('Constructive feedback focusing on task achievement and language use.'),
  improvementHints: z.array(z.string()).describe('Actionable tips for improving the response.'),
  modelAnswer: z.string().describe('A high-quality version of the response.'),
  unlockNextLevel: z.boolean().describe('Whether the quality is sufficient to progress to the next level.'),
});
export type AiJourneyEvaluationOutput = z.infer<typeof AiJourneyEvaluationOutputSchema>;

export async function aiJourneyEvaluation(input: AiJourneyEvaluationInput): Promise<AiJourneyEvaluationOutput> {
  return aiJourneyEvaluationFlow(input);
}

const aiJourneyEvaluationPrompt = ai.definePrompt({
  name: 'aiJourneyEvaluationPrompt',
  model: 'googleai/gemini-3.1-pro',
  input: { schema: AiJourneyEvaluationInputSchema },
  output: { schema: AiJourneyEvaluationOutputSchema },
  prompt: `You are an encouraging English Language Tutor for Malaysian students preparing for their {{{examType}}} exam.
  
  The student is participating in a "Gamified Writing Journey". 
  Current Story: {{{storyId}}}
  Current Level: {{{levelTitle}}}
  
  Student's Response:
  """
  {{{userText}}}
  """
  
  Evaluation Criteria:
  1. Content Relevance: Did they address the specific level prompt?
  2. Language Quality: Is the vocabulary and grammar appropriate for a {{{examType}}} candidate?
  3. Coherence: Is the writing organized and easy to follow?
  
  Provide:
  - A 'bandScore' aligned with {{{examType}}} standards.
  - Friendly 'feedback' that encourages the student.
  - Specific 'improvementHints' for grammar or vocabulary.
  - A 'modelAnswer' that shows a perfect example of this task.
  - Set 'unlockNextLevel' to true if the response is decent (passing grade).`,
});

const aiJourneyEvaluationFlow = ai.defineFlow(
  {
    name: 'aiJourneyEvaluationFlow',
    inputSchema: AiJourneyEvaluationInputSchema,
    outputSchema: AiJourneyEvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await aiJourneyEvaluationPrompt(input);
    return output!;
  }
);
