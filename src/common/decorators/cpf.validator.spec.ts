import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isCPF', async: false })
class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Remove non-digit characters
    const cpf = value.replace(/[^\d]/g, '');

    // Check length
    if (cpf.length !== 11) {
      return false;
    }

    // Check for all same digits
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Calculate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Calculate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'CPF inválido';
  }
}

describe('IsCPFConstraint', () => {
  let constraint: IsCPFConstraint;

  beforeEach(() => {
    constraint = new IsCPFConstraint();
  });

  describe('validate', () => {
    it('should return true for valid CPF', () => {
      expect(constraint.validate('529.982.247-25')).toBe(true);
    });

    it('should return false for CPF with invalid format', () => {
      expect(constraint.validate('529.982.247-2')).toBe(false);
      expect(constraint.validate('529.982.247')).toBe(false);
      expect(constraint.validate('529.982')).toBe(false);
      expect(constraint.validate('abc.def.ghi-jk')).toBe(false);
    });

    it('should return false for CPF with all same digits', () => {
      expect(constraint.validate('111.111.111-11')).toBe(false);
      expect(constraint.validate('222.222.222-22')).toBe(false);
      expect(constraint.validate('333.333.333-33')).toBe(false);
      expect(constraint.validate('444.444.444-44')).toBe(false);
      expect(constraint.validate('555.555.555-55')).toBe(false);
      expect(constraint.validate('666.666.666-66')).toBe(false);
      expect(constraint.validate('777.777.777-77')).toBe(false);
      expect(constraint.validate('888.888.888-88')).toBe(false);
      expect(constraint.validate('999.999.999-99')).toBe(false);
      expect(constraint.validate('000.000.000-00')).toBe(false);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(constraint.validate('529.982.247-24')).toBe(false);
      expect(constraint.validate('529.982.247-26')).toBe(false);
    });

    it('should return false for undefined or null values', () => {
      expect(constraint.validate(undefined)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(constraint.validate(12345678901)).toBe(false);
      expect(constraint.validate({})).toBe(false);
      expect(constraint.validate([])).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the default error message', () => {
      expect(constraint.defaultMessage()).toBe('CPF inválido');
    });
  });
});
