
'use server';
/**
 * @fileOverview A Genkit flow for evaluating mystery case writing missions.
 * 
 * This flow acts as a 'Senior Detective' examiner, grading student reports
 * based on both investigation accuracy and exam-level English rubrics.
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
  bandScore: z.string().describe('Estimated grade or band score based on official rubrics.'),
  feedback: z.string().describe('Detailed feedback written in the persona of a Senior Detective mentor.'),
  improvementHints: z.array(z.string()).describe('Specific linguistic or investigative corrections.'),
  modelAnswer: z.string().describe('A high-quality version of how the professional investigative report should look.'),
  unlockNextClue: z.boolean().describe('Whether the quality is high enough to progress the investigation.'),
});
export type AiMysteryEvaluationOutput = z.infer<typeof AiMysteryEvaluationOutputSchema>;

export async function aiMysteryEvaluation(input: AiMysteryEvaluationInput): Promise<AiMysteryEvaluationOutput> {
  return aiMysteryEvaluationFlow(input);
}

const aiMysteryEvaluationPrompt = ai.definePrompt({
  name: 'aiMysteryEvaluationPrompt',
  input: { schema: AiMysteryEvaluationInputSchema },
  output: { schema: AiMysteryEvaluationOutputSchema },
  prompt: `You are the Lead Investigator and Senior English Examiner for the Royal Language Academy. 
  You are training a new recruit who is preparing for their {{{examType}}} English exam through investigative roleplay.
  
  The recruit has submitted a report for Case: {{{caseId}}}, Mission Category: {{{missionType}}}.
  
  Recruit's Submission:
  """
  {{{userText}}}
  """
  
  Your Directive:
  Evaluate this report with the cold, precise eye of a crime consultant and the pedagogical rigor of a {{{examType}}} examiner.
  
  Assessment Criteria:
  1. Investigative Precision: Did they document the scene or testimony with enough detail to advance the case?
  2. Forensic Register: Did they use formal, professional English suitable for a police file? (e.g., using "observed" instead of "saw", "incident" instead of "thing").
  3. Linguistic Integrity: Check for grammar, sentence structure, and vocabulary richness appropriate for a {{{examType}}} candidate.
  
  Scoring:
  - Provide a 'bandScore' aligned with {{{examType}}} standards.
  - If the report is equivalent to a passing grade or better, set 'unlockNextClue' to true.
  
  Feedback Tone:
  - Write 'feedback' as a senior mentor. Use phrases like "Good work, recruit," or "This report is sloppy, cadet. Tighten up your descriptions."
  - Provide 'improvementHints' that focus on replacing weak verbs with stronger ones and correcting structural errors.
  - The 'modelAnswer' should be a masterpiece of investigative writing that would earn an 'A' or 'Band 5+'.`,
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
