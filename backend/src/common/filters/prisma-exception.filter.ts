import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/** Maps common Prisma errors to clean HTTP responses instead of 500s. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const map: Record<string, { status: number; message: string }> = {
      P2002: { status: HttpStatus.CONFLICT, message: 'A record with this value already exists' },
      P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
      P2003: { status: HttpStatus.BAD_REQUEST, message: 'Related record does not exist' },
    };
    const { status, message } = map[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
    };

    response.status(status).json({ statusCode: status, message, error: exception.code });
  }
}
