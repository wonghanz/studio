
'use server';
/**
 * @fileOverview A specialized AI examiner for formal MUET Task A and Task B simulations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LiveExaminerInputSchema = z.object({
  mode: z.enum(['task-a', 'task-b']),
  topic: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    text: z.string(),
    speakerName: z.string().optional(),
  })),
  userAudioDataUri: z.string().optional(),
  turnCount: z.number().default(0),
});
export type LiveExaminerInput = z.infer<typeof LiveExaminerInputSchema>;

const LiveExaminerOutputSchema = z.object({
  aiReply: z.string(),
  aiSpeakerName: z.string().optional(),
  isTestFinished: z.boolean(),
  evaluation: z.object({
    taskScore: z.number().describe('0-25'),
    languageScore: z.number().describe('0-25'),
    fluencyScore: z.number().describe('0-25'),
    totalScore: z.number().describe('0-75'),
    cefrLevel: z.string(),
    strengths: z.array(z.string()).length(3),
    weaknesses: z.array(z.string()).length(3),
    improvementTips: z.array(z.string()).length(3),
    modelResponse: z.string(),
    transcript: z.string(),
  }).optional(),
});
export type LiveExaminerOutput = z.infer<typeof LiveExaminerOutputSchema>;

const liveExaminerPrompt = ai.definePrompt({
  name: 'liveExaminerPrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: LiveExaminerInputSchema },
  output: { schema: LiveExaminerOutputSchema },
  prompt: `You are a Senior MUET Speaking Examiner. You are conducting a formal simulation of {{{mode}}}.

TOPIC: {{{topic}}}

HISTORY:
{{#each history}}
- {{role}} ({{speakerName}}): {{{text}}}
{{/each}}

LATEST USER AUDIO: {{#if userAudioDataUri}}{{media url=userAudioDataUri}}{{else}}None{{/if}}

CONDUCT RULES:
1. Be formal, concise, and professional. 
2. If mode is 'task-a', act as the Head Examiner.
3. If mode is 'task-b', act as the Head Examiner but also simulate two AI candidates: 
   - 'Candidate A' (dominant, tries to lead/interrupt)
   - 'Candidate B' (passive, waits for user to prompt them)
4. DYNAMIC FOLLOW-UPS: 
   - After the user's initial response, ask ONE dynamic follow-up question related to what they said.
   - After the user answers the follow-up (TurnCount >= 2), conclude the test and set 'isTestFinished' to true.
5. EVALUATION:
   - When finished, provide a full MUET Rubric evaluation.
   - Task Score (0-25), Language (0-25), Fluency (0-25). Total 0-75.
   - Map average (Total/3) to CEFR: 23-25: C1+, 20-22: C1, 15-19: High B2, 10-14: Mid B2, 5-9: B1, 0-4: A2.
   - Provide 3 specific strengths, 3 weaknesses, and 3 improvement tips.
   - Provide a high-band 'modelResponse' for this topic.

Generate your reply as JSON.`,
});

export async function aiLiveExaminer(input: LiveExaminerInput): Promise<LiveExaminerOutput> {
  const { output } = await liveExaminerPrompt(input);
  if (!output) throw new Error('AI Examiner failed to respond.');
  return output;
}
