import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({
    example: 'Um usuário com este email já existe',
    description: 'Mensagem detalhada do erro'
  })
  message: string;

  @ApiProperty({ example: '2025-02-25T21:44:48.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users' })
  path: string;
}
