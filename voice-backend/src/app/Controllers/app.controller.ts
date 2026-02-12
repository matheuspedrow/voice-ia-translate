import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Voice-to-Voice API',
      frontend: 'Acesse http://localhost:3000 para a interface',
      endpoints: {
        'GET /ping': 'Health check',
        'POST /api/chat/voice': 'Enviar áudio para transcrição e resposta da IA',
      },
    };
  }

  @Get('ping')
  getPing() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
