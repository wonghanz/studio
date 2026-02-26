'use server';
/**
 * @fileOverview A Genkit flow for evaluating short Daily Writing Quests.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiQuestEvaluationInputSchema = z.object({
  questTitle: z.string().describe('The title of the quest.'),
  prompt: z.string().describe('The specific prompt the user answered.'),
  userText: z.string().describe('The user\'s written response.'),
  wordTarget: z.string().describe('The expected word count range.'),
  examType: z.enum(['SPM', 'MUET']).describe('The target exam rubric.'),
});
export type AiQuestEvaluationInput = z.infer<typeof AiQuestEvaluationInputSchema>;

const AiQuestEvaluationOutputSchema = z.object({
  bandScore: z.string().describe('A score (e.g., "A", "Band 4").'),
  feedback: z.string().describe('Short encouraging feedback.'),
  improvementTips: z.array(z.string()).describe('2-3 specific tips.'),
  isCompleted: z.boolean().describe('Whether the task is considered successfully completed.'),
});
export type AiQuestEvaluationOutput = z.infer<typeof AiQuestEvaluationOutputSchema>;

export async function aiQuestEvaluation(input: AiQuestEvaluationInput): Promise<AiQuestEvaluationOutput> {
  return aiQuestEvaluationFlow(input);
}

const aiQuestEvaluationPrompt = ai.definePrompt({
  name: 'aiQuestEvaluationPrompt',
  input: { schema: AiQuestEvaluationInputSchema },
  output: { schema: AiQuestEvaluationOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are a supportive English coach for Malaysian students. 
  Evaluate this short "Daily Writing Quest" response.
  
  Quest: {{{questTitle}}}
  Prompt: {{{prompt}}}
  Target: {{{wordTarget}}}
  User Text:
  """
  {{{userText}}}
  """
  
  Rubric: {{{examType}}}
  
  Guidelines:
  1. Be encouraging and brief.
  2. Check if they met the word target roughly.
  3. Provide 2 specific tips for improvement.
  4. If the response is relevant and readable, set isCompleted to true.`,
});

const aiQuestEvaluationFlow = ai.defineFlow(
  {
    name: 'aiQuestEvaluationFlow',
    inputSchema: AiQuestEvaluationInputSchema,
    outputSchema: AiQuestEvaluationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await aiQuestEvaluationPrompt(input);
      if (!output) {
        throw new Error('AI failed to generate a valid quest evaluation.');
      }
      return output;
    } catch (e: any) {
      console.error('Quest Evaluation Error:', e);
      throw e;
    }
  }
);
