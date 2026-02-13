import { API_BASE_URL } from '@/config/api';
import type { ConversationMessage, VoiceChatResponse } from '@/models/chat.types';
import { getErrorMessage, parseApiErrorMessage } from '@/utils';

/** Tempo máximo de espera da API (60s - transcrição + LLM podem demorar) */
const REQUEST_TIMEOUT_MS = 60000;

export async function sendVoiceMessage(
  audioBlob: Blob,
  history: ConversationMessage[],
): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('history', JSON.stringify(history));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/chat/voice`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = parseApiErrorMessage(
        errorData,
        `Erro na requisição: ${response.status}`,
      );
      throw new Error(message);
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('A requisição demorou muito. Tente novamente.');
      }
      throw err;
    }
    throw new Error(
      getErrorMessage(err, 'Erro ao enviar áudio. Verifique sua conexão.'),
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
