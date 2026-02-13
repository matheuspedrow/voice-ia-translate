/** Variáveis de ambiente carregadas em tempo de execução */
export const env = {
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterApiUrl:
    process.env.OPENROUTER_API_URL ??
    'https://openrouter.ai/api/v1/chat/completions',
  defaultLlmModel:
    process.env.DEFAULT_LLM_MODEL ?? 'arcee-ai/trinity-large-preview:free',
  geminiTranscriptionModel:
    process.env.GEMINI_TRANSCRIPTION_MODEL ?? 'gemini-2.5-flash',
  openaiWhisperModel: process.env.OPENAI_WHISPER_MODEL ?? 'whisper-1',
} as const;
