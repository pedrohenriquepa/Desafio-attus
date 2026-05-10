import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { cepValidator, cpfValidator, emailValidator, phoneValidator } from './user-form.validators';

describe('user form validators', () => {
  it('should invalidate incorrect CPF', () => {
    const control = new FormControl('123.456.789-00');
    const result = cpfValidator(control);
    expect(result).toEqual({ cpf: true });
  });

  it('should validate correct CPF', () => {
    const control = new FormControl('529.982.247-25');
    const result = cpfValidator(control);
    expect(result).toBeNull();
  });

  it('should validate email format', () => {
    const invalid = new FormControl('email-invalido');
    const valid = new FormControl('ana@email.com');

    expect(emailValidator(invalid)).toEqual({ email: true });
    expect(emailValidator(valid)).toBeNull();
  });

  it('should validate phone format', () => {
    const invalid = new FormControl('(11) 9999-9999');
    const valid = new FormControl('(11) 91234-5678');

    expect(phoneValidator(invalid)).toEqual({ phone: true });
    expect(phoneValidator(valid)).toBeNull();
  });

  it('should validate CEP format', () => {
    const invalid = new FormControl('01001000');
    const valid = new FormControl('01001-000');

    expect(cepValidator(invalid)).toEqual({ cep: true });
    expect(cepValidator(valid)).toBeNull();
  });
});
