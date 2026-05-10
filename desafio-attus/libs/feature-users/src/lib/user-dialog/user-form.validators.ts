import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CPF_INVALID_PATTERN = /^(\d)\1+$/;

const CEP_REGEX = /^\d{5}-\d{3}$/;

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  return EMAIL_REGEX.test(value) ? null : { email: true };
};

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  if (digits.length !== 11 || CPF_INVALID_PATTERN.test(digits)) {
    return { cpf: true };
  }

  const numbers = digits.split('').map((digit) => Number(digit));

  const firstDigit = calculateCpfDigit(numbers, 9, 10);
  if (firstDigit !== numbers[9]) {
    return { cpf: true };
  }

  const secondDigit = calculateCpfDigit(numbers, 10, 11);
  if (secondDigit !== numbers[10]) {
    return { cpf: true };
  }

  return null;
};

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  const isValid = /^\(\d{2}\) \d{5}-\d{4}$/.test(value);
  return isValid ? null : { phone: true };
};

export const cepValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  return CEP_REGEX.test(value) ? null : { cep: true };
};

const calculateCpfDigit = (numbers: number[], length: number, weightStart: number): number => {
  let sum = 0;
  for (let index = 0; index < length; index += 1) {
    sum += numbers[index] * (weightStart - index);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
};
