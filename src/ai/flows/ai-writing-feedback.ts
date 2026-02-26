
'use server';
/**
 * @fileOverview An AI agent for providing official MUET/SPM rubric-based feedback on written essays.
 *
 * - aiWritingFeedback - A function that handles the essay evaluation process.
 * - AiWritingFeedbackInput - The input type for the aiWritingFeedback function.
 * - AiWritingFeedbackOutput - The return type for the aiWritingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWritingFeedbackInputSchema = z.object({
  essayText: z.string().describe('The student\'s essay text to be evaluated.'),
  examType: z.enum(['MUET', 'SPM']).describe('The target exam for the evaluation (MUET or SPM).'),
});
export type AiWritingFeedbackInput = z.infer<typeof AiWritingFeedbackInputSchema>;

const AiWritingFeedbackOutputSchema = z.object({
  taskFulfilmentScore: z.number().describe('Score for Task Fulfilment (0-20).'),
  languageOrganisationScore: z.number().describe('Score for Language & Organisation (0-20).'),
  totalScore: z.number().describe('Total score out of 40.'),
  cefrLevel: z.enum(['A2', 'B1', 'Mid B2', 'High B2', 'C1', 'C1+']).describe('Mapped CEFR level.'),
  feedback: z.string().describe('Detailed overall feedback.'),
  strengths: z.array(z.string()).describe('List of key strengths identified.'),
  weaknesses: z.array(z.string()).describe('List of key weaknesses identified.'),
  improvementTips: z.array(z.string()).describe('Actionable improvement suggestions.'),
  modelBand5Sample: z.string().describe('A high-quality sample of one paragraph from the essay.'),
});
export type AiWritingFeedbackOutput = z.infer<typeof AiWritingFeedbackOutputSchema>;

export async function aiWritingFeedback(input: AiWritingFeedbackInput): Promise<AiWritingFeedbackOutput> {
  return aiWritingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWritingFeedbackPrompt',
  input: {schema: AiWritingFeedbackInputSchema},
  output: {schema: AiWritingFeedbackOutputSchema},
  prompt: `You are an official MUET/SPM English writing examiner.

Evaluate the student's writing using the official marking scheme with TWO components:

1) Task Fulfilment (0–20 marks)
Evaluate based on:
- Response to task
- Development of ideas
- Maturity of treatment of the topic

2) Language & Organisation (0–20 marks)
Evaluate based on:
- Sentence structures
- Intelligibility
- Vocabulary
- Organisation (essay structure and linkers)

Use the following CEFR mapping for the Total Score (out of 40):
- 17–20 = C1+ (Note: This is the mapping for the component scores, for the TOTAL score 33-40 = C1+, 25-32 = C1, 19-24 = High B2, 13-18 = Mid B2, 7-12 = B1, 0-6 = A2)

Actually, use this precise mapping for the Total Score (0-40):
- 33–40: C1+
- 25–32: C1
- 19–24: High B2
- 13–18: Mid B2
- 7–12: B1
- 0–6: A2

Be strict and realistic. Do not inflate scores.

Essay:
{{{essayText}}}`,
});

const aiWritingFeedbackFlow = ai.defineFlow(
  {
    name: 'aiWritingFeedbackFlow',
    inputSchema: AiWritingFeedbackInputSchema,
    outputSchema: AiWritingFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
