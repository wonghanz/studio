
'use server';
/**
 * @fileOverview A Genkit flow for evaluating mystery case writing missions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiMysteryEvaluationInputSchema = z.object({
  caseId: z.string(),
  missionId: z.string(),
  userText: z.string().describe('The student\'s writing response for the mission.'),
  missionType: z.string().describe('The type of mission (e.g., scene description, witness report, analysis).'),
  examType: z.enum(['MUET', 'SPM']).describe('The target exam rubric.'),
});
export type AiMysteryEvaluationInput = z.infer<typeof AiMysteryEvaluationInputSchema>;

const AiMysteryEvaluationOutputSchema = z.object({
  bandScore: z.string().describe('Estimated grade or band score.'),
  feedback: z.string().describe('Detailed feedback on the writing.'),
  improvementHints: z.array(z.string()).describe('Specific things to fix or improve.'),
  modelAnswer: z.string().describe('A high-quality version of how the report should look.'),
  unlockNextClue: z.boolean().describe('Whether the quality is high enough to progress.'),
});
export type AiMysteryEvaluationOutput = z.infer<typeof AiMysteryEvaluationOutputSchema>;

export async function aiMysteryEvaluation(input: AiMysteryEvaluationInput): Promise<AiMysteryEvaluationOutput> {
  return aiMysteryEvaluationFlow(input);
}

const aiMysteryEvaluationPrompt = ai.definePrompt({
  name: 'aiMysteryEvaluationPrompt',
  input: { schema: AiMysteryEvaluationInputSchema },
  output: { schema: AiMysteryEvaluationOutputSchema },
  prompt: `You are an expert English Language Examiner and a Crime Consultant. 
  The student is participating in a detective roleplay game to improve their English for the {{{examType}}} exam.
  
  Mission Type: {{{missionType}}}
  User's Response:
  {{{userText}}}
  
  Evaluate the response based on:
  1. Task Achievement: Did they provide the necessary investigative details?
  2. Language Quality: Is the tone appropriate (formal for reports, accurate for descriptions)?
  3. Vocabulary: Use of relevant crime/scene vocabulary.
  
  If the response is at least a passing grade for a {{{examType}}} student, set unlockNextClue to true.
  Provide actionable improvement hints and a model answer.`,
});

const aiMysteryEvaluationFlow = ai.defineFlow(
  {
    name: 'aiMysteryEvaluationFlow',
    inputSchema: AiMysteryEvaluationInputSchema,
    outputSchema: AiMysteryEvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await aiMysteryEvaluationPrompt(input);
    return output!;
  }
);
