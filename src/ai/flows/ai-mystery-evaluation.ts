'use server';
/**
 * @fileOverview A Genkit flow for evaluating mystery case writing missions based on MUET standards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiMysteryEvaluationInputSchema = z.object({
  caseId: z.string(),
  missionId: z.string(),
  userText: z.string().describe('The student\'s writing response for the mission.'),
  missionType: z.string().describe('The type of mission (e.g., email, report, analysis).'),
  examType: z.enum(['MUET', 'SPM']).describe('The target exam rubric.'),
});
export type AiMysteryEvaluationInput = z.infer<typeof AiMysteryEvaluationInputSchema>;

const AiMysteryEvaluationOutputSchema = z.object({
  bandScore: z.string().describe('Estimated score (e.g., Band 4, Band 5.1).'),
  feedback: z.string().describe('Detailed feedback written in the persona of a Senior Detective / Chief of Police.'),
  improvementHints: z.array(z.string()).describe('Specific linguistic or investigative corrections.'),
  modelAnswer: z.string().describe('A high-quality version of how the professional investigative report should look.'),
  unlockNextClue: z.boolean().describe('Whether the quality is high enough to progress.'),
  detectedIntents: z.array(z.string()).optional().describe('Checklist of required intents found in the text.'),
  toneRating: z.enum(['Formal', 'Semi-Formal', 'Informal']).describe('The analyzed tone of the writing.'),
});
export type AiMysteryEvaluationOutput = z.infer<typeof AiMysteryEvaluationOutputSchema>;

export async function aiMysteryEvaluation(input: AiMysteryEvaluationInput): Promise<AiMysteryEvaluationOutput> {
  return aiMysteryEvaluationFlow(input);
}

const aiMysteryEvaluationPrompt = ai.definePrompt({
  name: 'aiMysteryEvaluationPrompt',
  input: { schema: AiMysteryEvaluationInputSchema },
  output: { schema: AiMysteryEvaluationOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are the Lead Investigator and Senior MUET Examiner for the Royal Language Academy. 
  You are training a new recruit who is preparing for their {{{examType}}} English exam through investigative roleplay.
  
  Current Mission Category: {{{missionType}}}
  
  Recruit's Submission:
  """
  {{{userText}}}
  """
  
  Your Directive:
  Evaluate this report with the cold, precise eye of a crime consultant and the pedagogical rigor of a {{{examType}}} examiner.
  
  Specific MUET Rubric Evaluation:
  1. Task Fulfilment: For Mission 1 (Email), did they Acknowledge, Decline, Suggest, and Ask? For Mission 2+, are their topic sentences strong and academic?
  2. Forensic Register: Did they use formal, professional English? (e.g., "observed" vs "saw", "incident" vs "thing"). TRIGGER A WARNING if they use slang like "bro", "wanna", or informal abbreviations.
  3. Cohesion & Organization: Check for effective use of discourse markers (Furthermore, Consequently, However).
  
  Scoring:
  - Provide a 'bandScore' aligned with standards.
  - If the report is equivalent to a passing grade, set 'unlockNextClue' to true.
  
  Feedback Tone:
  - Write 'feedback' as a senior mentor / Chief of Police. Use phrases like "Good work, recruit," or "This report is sloppy, cadet."
  - Provide 'improvementHints' that focus on replacing weak verbs with stronger ones.
  
  If the mission is Task 1 Email:
  - Check for 'detectedIntents': Acknowledge, Decline, Suggest, Ask.
  - Rate 'toneRating'.`,
});

const aiMysteryEvaluationFlow = ai.defineFlow(
  {
    name: 'aiMysteryEvaluationFlow',
    inputSchema: AiMysteryEvaluationInputSchema,
    outputSchema: AiMysteryEvaluationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await aiMysteryEvaluationPrompt(input);
      if (!output) {
        throw new Error('AI failed to generate a valid mystery evaluation.');
      }
      return output;
    } catch (e: any) {
      console.error('Mystery Evaluation Error:', e);
      throw e;
    }
  }
);
