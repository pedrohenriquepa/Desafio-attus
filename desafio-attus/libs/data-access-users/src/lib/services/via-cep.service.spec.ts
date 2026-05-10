import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ViaCepService } from './via-cep.service';

describe('ViaCepService', () => {
  let service: ViaCepService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ViaCepService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should map ViaCEP response to address data', () => {
    let resultValue:
      | {
          cep: string;
          street: string;
          neighborhood: string;
          city: string;
          state: string;
          complement: string;
        }
      | undefined;

    service.lookupCep('01001000').subscribe((result) => {
      resultValue = result;
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    request.flush({
      cep: '01001-000',
      logradouro: 'Praca da Se',
      complemento: 'lado impar',
      bairro: 'Se',
      localidade: 'Sao Paulo',
      uf: 'SP'
    });

    expect(resultValue).toEqual({
      cep: '01001-000',
      street: 'Praca da Se',
      neighborhood: 'Se',
      city: 'Sao Paulo',
      state: 'SP',
      complement: 'lado impar'
    });
  });

  it('should error when the cep does not exist', () => {
    let errorMessage = '';

    service.lookupCep('99999999').subscribe({
      error: (error: Error) => {
        errorMessage = error.message;
      }
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/99999999/json/');
    request.flush({ erro: true });

    expect(errorMessage).toBe('CEP nao encontrado.');
  });
});
