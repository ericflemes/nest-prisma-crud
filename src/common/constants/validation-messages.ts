export const ValidationMessages = {
  STRING_FIELD: (field: string) => `O campo ${field} deve ser uma string`,
  MIN_LENGTH: (field: string, min: number) => `O campo ${field} deve ter no mínimo ${min} caracteres`,
  MAX_LENGTH: (field: string, max: number) => `O campo ${field} deve ter no máximo ${max} caracteres`,
  REQUIRED_FIELD: (field: string) => `O campo ${field} é obrigatório`,
  INVALID_EMAIL: 'Email inválido',
  INVALID_DATE_FORMAT: 'Data inválida. Use o formato YYYY-MM-DD ou ISO',
  INVALID_PHONE_FORMAT: 'Telefone inválido. Use o formato +55 11 91234-5678',
  INVALID_CPF_FORMAT: 'CPF inválido. Use o formato 999.999.999-99',
  INVALID_CPF: 'CPF inválido. O número não é um CPF válido',
  INVALID_USER_TYPE: 'Tipo de usuário inválido. Use "primary" ou "secondary"',
  INVALID_STATUS: 'Status inválido. Use "active" ou "inactive"'
};
