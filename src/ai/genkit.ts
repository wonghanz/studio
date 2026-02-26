import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyAGvrPIK940-JoaG6XvZy5XYHe-XJ2qKNA"})],
  model: 'googleai/gemini-2.5-pro',
});
