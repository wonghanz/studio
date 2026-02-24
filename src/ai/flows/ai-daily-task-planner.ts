'use server';
/**
 * @fileOverview A Genkit flow for generating AI-suggested daily study tasks.
 *
 * - aiDailyTaskPlanner - A function that handles the generation of a daily study plan.
 * - AiDailyTaskPlannerInput - The input type for the aiDailyTaskPlanner function.
 * - AiDailyTaskPlannerOutput - The return type for the aiDailyTaskPlanner function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiDailyTaskPlannerInputSchema = z.object({
  targetExam: z.enum(['MUET', 'IELTS']).describe('The target English proficiency exam (MUET or IELTS).'),
  userProgressSummary: z.string().describe('A summary of the user\u0027s current band scores, identified strengths, and weaknesses across English skills.'),
});
export type AiDailyTaskPlannerInput = z.infer<typeof AiDailyTaskPlannerInputSchema>;

const AiDailyTaskPlannerOutputSchema = z.object({
  dailyTasks: z.array(
    z.object({
      type: z.enum(['Speaking', 'Writing', 'Reading', 'Listening']).describe('The type of English skill the task focuses on.'),
      description: z.string().describe('A detailed description of the study task.'),
      durationMinutes: z.number().optional().describe('The estimated duration of the task in minutes.'),
    })
  ).describe('A list of AI-suggested daily study tasks.'),
});
export type AiDailyTaskPlannerOutput = z.infer<typeof AiDailyTaskPlannerOutputSchema>;

export async function aiDailyTaskPlanner(input: AiDailyTaskPlannerInput): Promise<AiDailyTaskPlannerOutput> {
  return aiDailyTaskPlannerFlow(input);
}

const aiDailyTaskPlannerPrompt = ai.definePrompt({
  name: 'aiDailyTaskPlannerPrompt',
  input: { schema: AiDailyTaskPlannerInputSchema },
  output: { schema: AiDailyTaskPlannerOutputSchema },
  prompt: `You are an AI assistant tasked with generating a personalized daily study plan for a Malaysian student.

The student is preparing for the {{targetExam}} exam.
Their current progress and identified strengths and weaknesses are summarized as follows:
{{userProgressSummary}}

Based on this information, create a daily study plan consisting of a list of tasks. Each task should specify its type (Speaking, Writing, Reading, or Listening), a detailed description of the activity, and an optional estimated duration in minutes.

Focus on recommending tasks that directly address the student's weaknesses and align with the requirements of their target exam (MUET or IELTS).

Generate the plan in JSON format conforming to the following schema:
`,
});

const aiDailyTaskPlannerFlow = ai.defineFlow(
  {
    name: 'aiDailyTaskPlannerFlow',
    inputSchema: AiDailyTaskPlannerInputSchema,
    outputSchema: AiDailyTaskPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await aiDailyTaskPlannerPrompt(input);
    return output!;
  }
);
