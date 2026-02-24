'use server';
/**
 * @fileOverview An AI agent for providing examiner-style feedback on spoken English.
 *
 * - aiSpeakingExamination - A function that handles the speaking examination process.
 * - AiSpeakingExaminationInput - The input type for the aiSpeakingExamination function.
 * - AiSpeakingExaminationOutput - The return type for the aiSpeakingExamination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSpeakingExaminationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The recorded speech audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  examType: z.enum(['MUET', 'SPM']).describe('The target exam type (MUET or SPM).'),
  topic: z.string().describe('The topic or prompt the user was speaking about.'),
});
export type AiSpeakingExaminationInput = z.infer<typeof AiSpeakingExaminationInputSchema>;

const AiSpeakingExaminationOutputSchema = z.object({
  bandScore: z
    .string()
    .describe(
      'The estimated band score or grade for the spoken response (e.g., "A" for SPM, "Band 5" for MUET).'
    ),
  fluencyTips: z
    .string()
    .describe(
      'Constructive feedback and tips to improve fluency, including pacing, pauses, and repetition.'
    ),
  coherenceFeedback: z
    .string()
    .describe(
      'Feedback on the coherence and cohesion of the response, including logical flow, organization, and use of discourse markers.'
    ),
  modelAnswer: z
    .string()
    .describe(
      'A high-quality model answer for the given topic, demonstrating good speaking practices.'
    ),
});
export type AiSpeakingExaminationOutput = z.infer<typeof AiSpeakingExaminationOutputSchema>;

const aiSpeakingExaminationPrompt = ai.definePrompt({
  name: 'aiSpeakingExaminationPrompt',
  input: {schema: AiSpeakingExaminationInputSchema},
  output: {schema: AiSpeakingExaminationOutputSchema},
  prompt: `You are an expert MUET/SPM speaking examiner. Your task is to evaluate the provided audio recording of a student speaking on the topic "{{{topic}}}".

Based on the audio, provide a comprehensive evaluation in JSON format, including:
1.  An estimated band score or grade suitable for a {{{examType}}} exam (e.g., "A" or "B+" for SPM, "Band 5" for MUET).
2.  Specific and actionable tips to improve their fluency, considering aspects like pacing, natural pauses, and avoiding unnecessary repetition or hesitation.
3.  Feedback on the coherence and cohesion of their response, commenting on the logical flow of ideas, organization, and effective use of discourse markers.
4.  A concise model answer for the topic "{{{topic}}}", demonstrating good speaking practices.

Audio for evaluation: {{media url=audioDataUri}}

Ensure your output strictly follows the JSON schema provided.`,
});

const aiSpeakingExaminationFlow = ai.defineFlow(
  {
    name: 'aiSpeakingExaminationFlow',
    inputSchema: AiSpeakingExaminationInputSchema,
    outputSchema: AiSpeakingExaminationOutputSchema,
  },
  async input => {
    const {output} = await aiSpeakingExaminationPrompt(input);
    if (!output) {
      throw new Error('Failed to get a valid response from the AI speaking examiner.');
    }
    return output;
  }
);

export async function aiSpeakingExamination(
  input: AiSpeakingExaminationInput
): Promise<AiSpeakingExaminationOutput> {
  return aiSpeakingExaminationFlow(input);
}
