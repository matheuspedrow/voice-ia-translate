import { Module } from '@nestjs/common';
import { ChatController } from '../Controllers/chat.controller';
import { ChatService } from '../Services/chat.service';
import { TranscriptionService } from '../Services/transcription.service';
import { LlmService } from '../Services/llm.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, TranscriptionService, LlmService],
})
export class ChatModule {}
