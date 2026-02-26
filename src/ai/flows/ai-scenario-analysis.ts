
'use server';
/**
 * @fileOverview A Genkit flow for analyzing real-world scenarios from photos to provide English learning guidance.
 *
 * - aiScenarioAnalysis - A function that handles scenario analysis.
 * - AiScenarioAnalysisInput - Input type.
 * - AiScenarioAnalysisOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiScenarioAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a scenario, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  examType: z.enum(['SPM', 'MUET']).describe('The target exam level.'),
});
export type AiScenarioAnalysisInput = z.infer<typeof AiScenarioAnalysisInputSchema>;

const AiScenarioAnalysisOutputSchema = z.object({
  scenarioTitle: z.string().describe('A short, descriptive title for the scenario.'),
  description: z.string().describe('A concise description of what is happening in the scene.'),
  vocabulary: z.array(z.object({
    word: z.string(),
    meaning: z.string(),
    example: z.string()
  })).describe('5-8 advanced vocabulary words relevant to this specific scene.'),
  speakingGuidance: z.string().describe('Instructions on how to describe this scene orally.'),
  writingTask: z.string().describe('A specific writing prompt (e.g., report, letter, story) based on the scene.'),
  modelPhrases: z.array(z.string()).describe('Useful idiomatic phrases or connectors for this scenario.'),
});
export type AiScenarioAnalysisOutput = z.infer<typeof AiScenarioAnalysisOutputSchema>;

export async function aiScenarioAnalysis(input: AiScenarioAnalysisInput): Promise<AiScenarioAnalysisOutput> {
  return aiScenarioAnalysisFlow(input);
}

const aiScenarioAnalysisPrompt = ai.definePrompt({
  name: 'aiScenarioAnalysisPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: AiScenarioAnalysisInputSchema },
  output: { schema: AiScenarioAnalysisOutputSchema },
  prompt: `You are an expert English Language teacher for Malaysian students preparing for {{{examType}}}.

Analyze the provided image of a real-world scenario (e.g., an accident, a festive celebration, a daily chore, or a public event). 

Your goal is to help the student describe this scene in formal and accurate English. Provide:
1. A clear title and description.
2. High-level vocabulary words with meanings and examples suitable for {{{examType}}}.
3. Speaking guidance: how to structure a verbal description (e.g., using "firstly", "I can see").
4. A Writing Task: A prompt that asks the student to write about this scene (e.g., "Write a police report" or "Write a blog post").
5. Model phrases: Useful collocations or sentence starters.

Photo: {{media url=photoDataUri}}`,
});

const aiScenarioAnalysisFlow = ai.defineFlow(
  {
    name: 'aiScenarioAnalysisFlow',
    inputSchema: AiScenarioAnalysisInputSchema,
    outputSchema: AiScenarioAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await aiScenarioAnalysisPrompt(input);
    return output!;
  }
);
