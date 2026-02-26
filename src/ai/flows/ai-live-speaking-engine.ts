'use server';
/**
 * @fileOverview A multi-purpose live speaking engine for Roleplay and Group Discussions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LiveSpeakingInputSchema = z.object({
  mode: z.enum(['roleplay', 'group']),
  scenario: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    text: z.string(),
    speakerName: z.string().optional(),
  })),
  userAudioDataUri: z.string().optional().describe("User's latest spoken audio."),
  examType: z.enum(['SPM', 'MUET']).default('MUET'),
});
export type LiveSpeakingInput = z.infer<typeof LiveSpeakingInputSchema>;

const LiveSpeakingOutputSchema = z.object({
  aiReply: z.string().describe("The text response from the AI teammate or character."),
  aiSpeakerName: z.string().optional().describe("Name of the teammate speaking."),
  isSessionFinished: z.boolean().describe("Whether the conversation has reached a natural conclusion."),
  evaluation: z.object({
    bandScore: z.string().optional(),
    fluencyFeedback: z.string().optional(),
    pronunciationFeedback: z.string().optional(),
    coherenceFeedback: z.string().optional(),
    betterResponses: z.array(z.string()).optional(),
  }).optional(),
});
export type LiveSpeakingOutput = z.infer<typeof LiveSpeakingOutputSchema>;

const liveSpeakingPrompt = ai.definePrompt({
  name: 'liveSpeakingPrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: LiveSpeakingInputSchema },
  output: { schema: LiveSpeakingOutputSchema },
  prompt: `You are an AI assistant facilitating a Live Speaking session for a student preparing for {{{examType}}}.

MODE: {{{mode}}}
SCENARIO: {{{scenario}}}

HISTORY:
{{#each history}}
- {{role}} ({{speakerName}}): {{{text}}}
{{/each}}

LATEST USER AUDIO: {{#if userAudioDataUri}}{{media url=userAudioDataUri}}{{else}}None{{/if}}

INSTRUCTIONS:
1. Roleplay: Act as the character in the scenario.
2. Group: Act as 'Ahmad' or 'Sara' AI teammates.
3. If TurnCount > 5 or user says goodbye, set 'isSessionFinished' to true and evaluate.

Generate JSON response.`,
});

export async function aiLiveSpeakingEngine(input: LiveSpeakingInput): Promise<LiveSpeakingOutput> {
  const { output } = await liveSpeakingPrompt(input);
  if (!output) throw new Error('Failed to generate live speaking response.');
  return output;
}