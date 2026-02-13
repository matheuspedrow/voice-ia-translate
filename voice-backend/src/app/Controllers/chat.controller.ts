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
import { MIN_RECORDING_SIZE } from '../Utils/constants';

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
      throw new BadRequestException({
        message: 'Nenhum áudio recebido.',
        detail: 'Grave novamente segurando o botão e solte quando terminar.',
      });
    }

    if (file.size < MIN_RECORDING_SIZE) {
      throw new BadRequestException({
        message: 'Gravação muito curta.',
        detail: 'Segure o botão por mais tempo e fale. Solte quando terminar.',
      });
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

      const status = isConfigError ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_REQUEST;
      const errorResponse = isConfigError
        ? {
            message: 'Serviço temporariamente indisponível.',
            detail: message,
          }
        : {
            message: 'Não foi possível processar o áudio.',
            detail: message,
          };

      throw new HttpException(errorResponse, status);
    }
  }
}
