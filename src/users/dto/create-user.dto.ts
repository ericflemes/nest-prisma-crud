import { IsString, IsEmail, IsDateString, MinLength, Matches, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString({ message: 'O campo nome completo deve ser uma string' })
  @MinLength(3, { message: 'O campo nome completo deve ter no mínimo 3 caracteres' })
  fullName: string;

  @ApiProperty({ example: '2010-05-15T00:00:00Z', description: 'Data de nascimento' })
  @IsDateString({}, { message: 'A data de nascimento deve estar em formato ISO' })
  birthDate: string;

  @ApiProperty({ example: 'joao.silva@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'O email fornecido é inválido' })
  email: string;

  @ApiProperty({ example: '+55 11 91234-5678', description: 'Número de telefone' })
  @Matches(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/, {
    message: 'O número de telefone deve estar no formato +55 XX XXXXX-XXXX'
  })
  phoneNumber: string;

  @ApiProperty({ example: 'Rua Ibirajá', description: 'Endereço linha 1' })
  @IsString({ message: 'O endereço linha 1 deve ser uma string' })
  @MinLength(3, { message: 'O endereço linha 1 deve ter no mínimo 3 caracteres' })
  address1: string;

  @ApiProperty({ example: 'N90', description: 'Endereço linha 2', required: false })
  @IsString({ message: 'O endereço linha 2 deve ser uma string' })
  @IsOptional()
  address2: string | null;

  @ApiProperty({ example: 'São Paulo', description: 'Endereço linha 3', required: false })
  @IsString({ message: 'O endereço linha 3 deve ser uma string' })
  @IsOptional()
  address3: string | null;

  @ApiProperty({ example: 'SP', description: 'Endereço linha 4', required: false })
  @IsString({ message: 'O endereço linha 4 deve ser uma string' })
  @IsOptional()
  address4: string | null;

  @ApiProperty({ example: '078.153.166-70', description: 'CPF do usuário' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
  })
  cpf: string;

  @ApiProperty({ example: 'primary', description: 'Tipo do usuário', enum: ['primary', 'secondary'] })
  @IsIn(['primary', 'secondary'], {
    message: 'O tipo de usuário deve ser primary ou secondary'
  })
  userType: string;

  @ApiProperty({ example: 'marca-x', description: 'Marca do usuário' })
  @IsString({ message: 'A marca deve ser uma string' })
  @MinLength(2, { message: 'A marca deve ter no mínimo 2 caracteres' })
  brand: string;
}
