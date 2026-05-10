import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Address } from '../models/user.model';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ViaCepService {
  private readonly http = inject(HttpClient);

  lookupCep(cep: string): Observable<Omit<Address, 'number'>> {
    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`)
      .pipe(
        map((response) => {
          if (response.erro) {
            throw new Error('CEP nao encontrado.');
          }

          return {
            cep: response.cep,
            street: response.logradouro,
            neighborhood: response.bairro,
            city: response.localidade,
            state: response.uf,
            complement: response.complemento ?? ''
          };
        })
      );
  }
}
