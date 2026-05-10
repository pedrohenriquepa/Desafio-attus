import { Injectable } from '@angular/core';
import { delay, forkJoin, map, Observable, of } from 'rxjs';

import { User } from '../models/user.model';

const SEED_USERS: User[] = [
  {
    id: '1',
    name: 'Pedro Henrique',
    email: 'pedro.henrique@email.com',
    cpf: '529.982.247-25',
    phone: '(11) 91234-5678',
    phoneType: 'Celular',
    status: 'Ativo',
    address: {
      cep: '01001-000',
      street: 'Praca da Se',
      number: '120',
      neighborhood: 'Se',
      city: 'Sao Paulo',
      state: 'SP',
      complement: 'lado impar'
    }
  },
  {
    id: '2',
    name: 'Marina Souza',
    email: 'marina.souza@email.com',
    cpf: '111.444.777-35',
    phone: '(21) 99876-5432',
    phoneType: 'Residencial',
    status: 'Ativo',
    address: {
      cep: '20040-020',
      street: 'Rua da Quitanda',
      number: '85',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      complement: 'apto 302'
    }
  },
  {
    id: '3',
    name: 'Lucas Pereira',
    email: 'lucas.pereira@email.com',
    cpf: '935.411.347-80',
    phone: '(31) 93333-2222',
    phoneType: 'Comercial',
    status: 'Inativo',
    address: {
      cep: '30130-010',
      street: 'Avenida Afonso Pena',
      number: '4000',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
      complement: 'sala 1205'
    }
  },
  {
    id: '4',
    name: 'Ana Carolina',
    email: 'ana.carolina@email.com',
    cpf: '529.982.247-25',
    phone: '(41) 98765-4321',
    phoneType: 'Celular',
    status: 'Ativo',
    address: {
      cep: '80010-000',
      street: 'Rua XV de Novembro',
      number: '450',
      neighborhood: 'Centro',
      city: 'Curitiba',
      state: 'PR',
      complement: 'cobertura'
    }
  },
  {
    id: '5',
    name: 'Rafael Mendes',
    email: 'rafael.mendes@email.com',
    cpf: '111.444.777-35',
    phone: '(51) 90000-1111',
    phoneType: 'Residencial',
    status: 'Inativo',
    address: {
      cep: '90010-150',
      street: 'Rua dos Andradas',
      number: '990',
      neighborhood: 'Centro Historico',
      city: 'Porto Alegre',
      state: 'RS',
      complement: 'fundos'
    }
  }
];

@Injectable({ providedIn: 'root' })
export class UsersService {
  private users = [...SEED_USERS];

  getUsers(): Observable<User[]> {
    return forkJoin({
      users: of(this.users),
      requestedAt: of(Date.now())
    }).pipe(
      map(({ users }) => [...users]),
      delay(500)
    );
  }

  addUser(user: User): Observable<User> {
    this.users = [...this.users, user];
    return of(user).pipe(delay(500));
  }

  updateUser(updated: User): Observable<User> {
    this.users = this.users.map((user) => (user.id === updated.id ? updated : user));
    return of(updated).pipe(delay(500));
  }
}
