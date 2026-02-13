/** Variáveis de ambiente (server-side apenas - API routes) */
export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterApiUrl:
    process.env.OPENROUTER_API_URL ??
    'https://openrouter.ai/api/v1/chat/completions',
  defaultLlmModel:
    process.env.DEFAULT_LLM_MODEL ?? 'arcee-ai/trinity-large-preview:free',
  geminiTranscriptionModel:
    process.env.GEMINI_TRANSCRIPTION_MODEL ?? 'gemini-2.5-flash',
} as const;
