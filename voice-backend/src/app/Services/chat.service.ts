import { Injectable } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { LlmService } from './llm.service';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceChatResponse {
  userTranscript: string;
  assistantResponse: string;
  error?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly transcriptionService: TranscriptionService,
    private readonly llmService: LlmService,
  ) {}

  async processVoiceMessage(
    audioBuffer: Buffer,
    history: ConversationMessage[],
  ): Promise<VoiceChatResponse> {
    const userTranscript = await this.transcriptionService.transcribe(
      audioBuffer,
    );

    if (!userTranscript) {
      return {
        userTranscript: '',
        assistantResponse: '',
        error: 'Não foi possível transcrever o áudio. Tente gravar novamente.',
      };
    }

    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    messages.push({ role: 'user', content: userTranscript });

    const assistantResponse = await this.llmService.generateResponse(messages);

    return {
      userTranscript,
      assistantResponse,
    };
  }
}
