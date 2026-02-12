import { Module } from '@nestjs/common';
import { AppController } from './app/Controllers/app.controller';
import { ChatModule } from './app/Modules/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [AppController],
})
export class AppModule {}
