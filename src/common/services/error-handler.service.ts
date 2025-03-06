import { Injectable, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  handleError(error: any): void {
    this.logger.error('An error occurred', {
      error: error.message,
      stack: error.stack,
    });
  }

  handleValidationError(errors: ValidationError[]): void {
    this.logger.error('Validation error', { errors });
  }
}
