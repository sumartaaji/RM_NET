import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: ReturnType<typeof genkit> | null = null;

export function getGenkit() {
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  return aiInstance;
}

export const ai = new Proxy({} as ReturnType<typeof genkit>, {
  get(_, prop) {
    const instance = getGenkit();
    return (instance as any)[prop];
  },
});
