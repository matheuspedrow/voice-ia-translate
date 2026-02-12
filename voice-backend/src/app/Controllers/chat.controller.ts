import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService, ConversationMessage } from '../Services/chat.service';
import {
  MAX_AUDIO_FILE_SIZE,
  ALLOWED_AUDIO_MIME_TYPES,
} from '../Utils/constants';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('voice')
  @UseInterceptors(FileInterceptor('audio'))
  async processVoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('history') historyJson?: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Áudio não enviado. Envie o arquivo no campo "audio".',
      );
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Máximo: ${MAX_AUDIO_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    const baseMimeType = file.mimetype?.split(';')[0] ?? '';
    if (!(ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(baseMimeType)) {
      throw new BadRequestException(
        `Formato não suportado. Use: ${ALLOWED_AUDIO_MIME_TYPES.join(', ')}`,
      );
    }

    let history: ConversationMessage[] = [];
    try {
      history = historyJson ? JSON.parse(historyJson) : [];
    } catch {
      history = [];
    }

    try {
      return await this.chatService.processVoiceMessage(file.buffer, history);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao processar áudio';
      const isConfigError =
        message.includes('não configurada') ||
        message.includes('OPENROUTER') ||
        message.includes('OPENAI') ||
        message.includes('GEMINI') ||
        message.includes('API Gemini') ||
        message.includes('API OpenRouter');
      throw new HttpException(
        message,
        isConfigError ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_REQUEST,
      );
    }
  }
}
