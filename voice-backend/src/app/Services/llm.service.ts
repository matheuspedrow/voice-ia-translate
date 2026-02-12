import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { env } from '../Config/env';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class LlmService {
  async generateResponse(
    messages: ChatMessage[],
    model = env.defaultLlmModel,
  ): Promise<string> {
    if (!env.openrouterApiKey) {
      throw new Error(
        'OPENROUTER_API_KEY não configurada. Obtenha em https://openrouter.ai/keys',
      );
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content:
        'Você é um assistente de voz amigável. Responda de forma concisa e natural, como em uma conversa verbal. Evite listas longas e formatações complexas.',
    };

    try {
      const { data } = await axios.post(
        env.openrouterApiUrl,
        {
          model,
          messages: [systemMessage, ...messages],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${env.openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.frontendUrl,
          },
          timeout: 60000,
        },
      );

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta inválida da API OpenRouter');
      }
      return content.trim();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const msg =
          (err.response.data as { error?: { message?: string } })?.error
            ?.message ?? err.message;
        throw new Error(`API OpenRouter (${status}): ${msg}`);
      }
      throw err;
    }
  }
}
