import OpenAI, { toFile } from 'openai';
import axios from 'axios';
import { env } from './env';

const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

const TRANSCRIPTION_ERROR_MESSAGE =
  'Configure GEMINI_API_KEY ou OPENAI_API_KEY. Gemini: https://aistudio.google.com/apikey | OpenAI: https://platform.openai.com/api-keys';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

export async function transcribe(audioBuffer: Buffer): Promise<string> {
  if (env.geminiApiKey) return transcribeWithGemini(audioBuffer);
  if (env.openaiApiKey) return transcribeWithOpenAI(audioBuffer);
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
  if (!env.openaiApiKey) throw new Error(TRANSCRIPTION_ERROR_MESSAGE);

  const openai = new OpenAI({ apiKey: env.openaiApiKey });
  const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: env.openaiWhisperModel,
    language: 'pt',
  });

  return transcription.text?.trim() ?? '';
}
