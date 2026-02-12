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
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (Array.isArray((res as { message: unknown }).message)
              ? (res as { message: string[] }).message.join(', ')
              : String((res as { message: string }).message))
          : exception.message;
    } else {
      message =
        exception instanceof Error
          ? exception.message
          : 'Erro interno do servidor';
    }

    this.logger.error(message, exception instanceof Error ? exception.stack : '');

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
