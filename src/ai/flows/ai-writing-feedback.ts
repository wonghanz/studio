'use server';
/**
 * @fileOverview An AI agent for providing rubric-based feedback on written essays.
 *
 * - aiWritingFeedback - A function that handles the essay evaluation process.
 * - AiWritingFeedbackInput - The input type for the aiWritingFeedback function.
 * - AiWritingFeedbackOutput - The return type for the aiWritingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWritingFeedbackInputSchema = z.object({
  essayText: z.string().describe('The student\'s essay text to be evaluated.'),
  examType: z.enum(['MUET', 'IELTS']).describe('The target exam for the evaluation (MUET or IELTS).'),
});
export type AiWritingFeedbackInput = z.infer<typeof AiWritingFeedbackInputSchema>;

const AiWritingFeedbackOutputSchema = z.object({
  bandScore: z.number().describe('The overall band score awarded for the essay.'),
  feedback: z.string().describe('Detailed rubric-based feedback on the essay, covering areas like task achievement, coherence, vocabulary, and grammar.'),
  strengths: z.array(z.string()).describe('List of key strengths identified in the essay.'),
  weaknesses: z.array(z.string()).describe('List of key weaknesses identified in the essay, with suggestions for improvement.'),
});
export type AiWritingFeedbackOutput = z.infer<typeof AiWritingFeedbackOutputSchema>;

export async function aiWritingFeedback(input: AiWritingFeedbackInput): Promise<AiWritingFeedbackOutput> {
  return aiWritingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWritingFeedbackPrompt',
  input: {schema: AiWritingFeedbackInputSchema},
  output: {schema: AiWritingFeedbackOutputSchema},
  prompt: `You are an expert English language examiner specializing in the {{{examType}}} writing exam.

Evaluate the following essay based on the official {{{examType}}} writing rubric, focusing on Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.

Provide an overall band score (e.g., 5, 6.5, 7), detailed rubric-based feedback, and explicitly list the essay's strengths and weaknesses with actionable improvement suggestions.

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
