'use server';
/**
 * @fileOverview An AI agent for providing official MUET rubric-based feedback on spoken English.
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
  taskFulfilmentScore: z.number().describe('Score for Task Fulfilment (0-25).'),
  languageScore: z.number().describe('Score for Language (0-25).'),
  fluencyConfidenceScore: z.number().describe('Score for Fluency & Confidence (0-25).'),
  totalScore: z.number().describe('Total score out of 75.'),
  cefrLevel: z.enum(['A2', 'B1', 'Mid B2', 'High B2', 'C1', 'C1+']).describe('Mapped CEFR level.'),
  feedbackPoints: z.array(z.string()).length(3).describe('3 examiner-style feedback points.'),
  pronunciationTips: z.string().describe('Specific tips to improve pronunciation.'),
  modelAnswer: z.string().describe('A high-quality model answer for the given topic.'),
  transcript: z.string().describe('The transcribed text of the spoken response.'),
});
export type AiSpeakingExaminationOutput = z.infer<typeof AiSpeakingExaminationOutputSchema>;

const aiSpeakingExaminationPrompt = ai.definePrompt({
  name: 'aiSpeakingExaminationPrompt',
  model: 'googleai/gemini-3.1-pro',
  input: {schema: AiSpeakingExaminationInputSchema},
  output: {schema: AiSpeakingExaminationOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an official MUET speaking examiner. Your task is to evaluate the provided audio recording of a student speaking on the topic "{{{topic}}}".

Evaluate the performance using these THREE criteria (25 marks each):

1) Task Fulfilment (0–25 marks)
- Relevance to topic
- Development of ideas

2) Language (0–25 marks)
- Proficiency of language
- Intelligibility
- Vocabulary range & appropriacy

3) Fluency & Confidence (0–25 marks)
- Fluency (hesitations, pauses, smoothness)
- Confidence (tone, assertiveness)

Calculate the Total Score (0-75).
Map the Average Score (Total/3) to the CEFR band using this scale:
- 23–25: C1+
- 20–22: C1
- 15–19: High B2
- 10–14: Mid B2
- 5–9: B1
- 0–4: A2

Return the evaluation in JSON format including:
- Scores for each category and the total.
- The CEFR level.
- 3 specific examiner-style feedback points.
- Actionable pronunciation tips.
- A concise model answer.
- The full transcript of the audio.

Audio for evaluation: {{media url=audioDataUri}}

Be strict and professional. Do not inflate scores.`,
});

const aiSpeakingExaminationFlow = ai.defineFlow(
  {
    name: 'aiSpeakingExaminationFlow',
    inputSchema: AiSpeakingExaminationInputSchema,
    outputSchema: AiSpeakingExaminationOutputSchema,
  },
  async input => {
    try {
      const {output} = await aiSpeakingExaminationPrompt(input);
      if (!output) {
        throw new Error('Failed to get a valid response from the AI speaking examiner.');
      }
      return output;
    } catch (e: any) {
      console.error('Speaking Evaluation Error:', e);
      throw e;
    }
  }
);

export async function aiSpeakingExamination(
  input: AiSpeakingExaminationInput
): Promise<AiSpeakingExaminationOutput> {
  return aiSpeakingExaminationFlow(input);
}
