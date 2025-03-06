import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Log error details in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.error('Error details:', {
        exception,
        stack: (exception as Error).stack,
      });
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        error = 'Conflito';
        
        // Get the field that caused the unique constraint violation
        const target = Array.isArray(exception.meta?.target) 
          ? exception.meta?.target[0] 
          : undefined;

        switch (target) {
          case 'users_email_key':
            message = 'Um usuário com este email já existe';
            break;
          case 'users_cpf_key':
            message = 'Um usuário com este CPF já existe';
            break;
          default:
            message = 'Registro duplicado encontrado';
        }
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        error = 'Não Encontrado';
        message = 'Registro não encontrado';
      } else {
        status = HttpStatus.BAD_REQUEST;
        error = 'Erro do Banco de Dados';
        message = 'Ocorreu um erro ao processar sua solicitação';
      }
    }

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: (exception as Error).stack,
        }),
      });
  }
}
