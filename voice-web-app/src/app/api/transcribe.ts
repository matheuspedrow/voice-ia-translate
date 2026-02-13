import OpenAI, { toFile } from 'openai';
import axios from 'axios';
import { env } from './env';

const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

const TRANSCRIPTION_ERROR_MESSAGE =
  'Configure GEMINI_API_KEY. Gemini: https://aistudio.google.com/apikey';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

export async function transcribe(audioBuffer: Buffer): Promise<string> {
  if (env.geminiApiKey) return transcribeWithGemini(audioBuffer);
  throw new Error(TRANSCRIPTION_ERROR_MESSAGE);
}

async function transcribeWithGemini(audioBuffer: Buffer): Promise<string> {
  if (!env.geminiApiKey) throw new Error(TRANSCRIPTION_ERROR_MESSAGE);

  const base64Audio = audioBuffer.toString('base64');

  const { data } = await axios.post<GeminiResponse>(
    `${GEMINI_BASE_URL}/${env.geminiTranscriptionModel}:generateContent?key=${env.geminiApiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: 'Transcreva este áudio em português. Retorne apenas o texto transcrito, sem explicações.',
            },
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Audio,
              },
            },
          ],
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    },
  );

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    const apiError = data?.error?.message ?? 'Resposta sem texto';
    throw new Error(`Gemini: ${apiError}`);
  }
  return text;
}

async function transcribeWithOpenAI(audioBuffer: Buffer): Promise<string> {
  throw new Error(TRANSCRIPTION_ERROR_MESSAGE);
}
