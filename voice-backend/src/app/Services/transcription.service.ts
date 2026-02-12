import { Injectable } from '@nestjs/common';
import OpenAI, { toFile } from 'openai';
import axios from 'axios';
import { env } from '../Config/env';

const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

const TRANSCRIPTION_ERROR_MESSAGE =
  'Configure GEMINI_API_KEY ou OPENAI_API_KEY em .env. Gemini: https://aistudio.google.com/apikey | OpenAI: https://platform.openai.com/api-keys';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

@Injectable()
export class TranscriptionService {
  private readonly openaiClient: OpenAI | null;

  constructor() {
    this.openaiClient = env.openaiApiKey
      ? new OpenAI({ apiKey: env.openaiApiKey })
      : null;
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    if (env.geminiApiKey) return this.transcribeWithGemini(audioBuffer);
    if (this.openaiClient) return this.transcribeWithOpenAI(audioBuffer);
    throw new Error(TRANSCRIPTION_ERROR_MESSAGE);
  }

  private async transcribeWithGemini(audioBuffer: Buffer): Promise<string> {
    if (!env.geminiApiKey) throw new Error(TRANSCRIPTION_ERROR_MESSAGE);

    const base64Audio = audioBuffer.toString('base64');

    try {
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
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const msg =
          (err.response.data as { error?: { message?: string } })?.error
            ?.message ?? err.message;
        throw new Error(`API Gemini (${status}): ${msg}`);
      }
      throw err;
    }
  }

  private async transcribeWithOpenAI(audioBuffer: Buffer): Promise<string> {
    if (!this.openaiClient) throw new Error(TRANSCRIPTION_ERROR_MESSAGE);

    try {
      const file = await toFile(audioBuffer, 'audio.webm', {
        type: 'audio/webm',
      });

      const transcription =
        await this.openaiClient.audio.transcriptions.create({
          file,
          model: env.openaiWhisperModel,
          language: 'pt',
        });

      return transcription.text?.trim() ?? '';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na API OpenAI';
      throw new Error(`Transcrição: ${message}`);
    }
  }
}
