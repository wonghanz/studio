
'use server';
/**
 * @fileOverview A Genkit flow for converting text to speech using Gemini 2.5 Flash TTS.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const AiTtsInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type AiTtsInput = z.infer<typeof AiTtsInputSchema>;

const AiTtsOutputSchema = z.object({
  media: z.string().describe('The audio data as a base64 encoded data URI.'),
});
export type AiTtsOutput = z.infer<typeof AiTtsOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function aiTts(input: AiTtsInput): Promise<AiTtsOutput> {
  return aiTtsFlow(input);
}

const aiTtsFlow = ai.defineFlow(
  {
    name: 'aiTtsFlow',
    inputSchema: AiTtsInputSchema,
    outputSchema: AiTtsOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No media returned from TTS model');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
