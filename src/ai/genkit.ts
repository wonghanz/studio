import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || 'AIzaSyBl-a-hPfCqCruy4O4RlzMPk8YLzJJzixs',
    }),
  ],
  model: 'googleai/gemini-3.0-flash',
});
