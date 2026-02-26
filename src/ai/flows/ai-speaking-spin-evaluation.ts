
'use server';
/**
 * @fileOverview A Genkit flow for evaluating Spin-the-Topic speaking tasks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeakingSpinInputSchema = z.object({
  topic: z.string(),
  constraint: z.string(),
  audioDataUri: z.string(),
  examType: z.enum(['SPM', 'MUET']).default('MUET'),
});
export type SpeakingSpinInput = z.infer<typeof SpeakingSpinInputSchema>;

const SpeakingSpinOutputSchema = z.object({
  bandScore: z.string(),
  feedback: z.string(),
  metConstraint: z.boolean(),
  tips: z.array(z.string()),
});
export type SpeakingSpinOutput = z.infer<typeof SpeakingSpinOutputSchema>;

const speakingSpinPrompt = ai.definePrompt({
  name: 'speakingSpinPrompt',
  input: { schema: SpeakingSpinInputSchema },
  output: { schema: SpeakingSpinOutputSchema },
  prompt: `You are a professional English speaking examiner.
Evaluate the student's 30-60 second response to a randomly selected topic.

Topic: {{{topic}}}
Constraint to follow: {{{constraint}}}

Audio: {{media url=audioDataUri}}

Criteria:
1. Did they address the topic?
2. Did they meet the constraint (e.g., used a specific connector)?
3. Fluency and clarity.

Provide a band score suitable for {{{examType}}} and constructive feedback.`,
});

export async function aiSpeakingSpinEvaluation(input: SpeakingSpinInput): Promise<SpeakingSpinOutput> {
  const { output } = await speakingSpinPrompt(input);
  if (!output) throw new Error('Failed to evaluate spin task.');
  return output;
}
