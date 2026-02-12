/** Limite de tamanho do áudio (25MB - compatível com Whisper/Gemini) */
export const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024;

/** Formatos de áudio aceitos pelo backend */
export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp3',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
] as const;
