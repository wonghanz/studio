import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCY4b934dukm565TB3agiwhEkG41tigL5E',
    }),
  ],
  model: 'googleai/gemini-3.0-flash',
});
