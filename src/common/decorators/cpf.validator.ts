import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Remove caracteres especiais
          const cpf = value.replace(/[^\d]/g, '');

          // Verifica se tem 11 dígitos
          if (cpf.length !== 11) return false;

          // Verifica se todos os dígitos são iguais
          if (/^(\d)\1{10}$/.test(cpf)) return false;

          // Calcula o primeiro dígito verificador
          let soma = 0;
          for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
          }
          let resto = 11 - (soma % 11);
          let dv1 = resto > 9 ? 0 : resto;

          // Calcula o segundo dígito verificador
          soma = 0;
          for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
          }
          resto = 11 - (soma % 11);
          let dv2 = resto > 9 ? 0 : resto;

          // Verifica se os dígitos verificadores estão corretos
          return dv1 === parseInt(cpf.charAt(9)) && dv2 === parseInt(cpf.charAt(10));
        },
        defaultMessage(args: ValidationArguments) {
          return 'CPF inválido';
        },
      },
    });
  };
}
