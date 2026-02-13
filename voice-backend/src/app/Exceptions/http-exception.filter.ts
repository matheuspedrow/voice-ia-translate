import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let detail: string | undefined;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: unknown }).message;
        message = Array.isArray(msg) ? msg.join(', ') : String(msg);
        detail = (res as { detail?: string }).detail;
      } else {
        message = exception.message;
      }
    } else {
      message =
        exception instanceof Error
          ? exception.message
          : 'Erro interno do servidor';
    }

    this.logger.error(message, exception instanceof Error ? exception.stack : '');

    const payload: { statusCode: number; message: string; detail?: string } = {
      statusCode: status,
      message: detail ? `${message}. ${detail}` : message,
    };
    response.status(status).json(payload);
  }
}
