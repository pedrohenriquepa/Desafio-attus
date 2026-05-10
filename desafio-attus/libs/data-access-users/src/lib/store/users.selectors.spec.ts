import { describe, expect, it } from 'vitest';

import { User } from '../models/user.model';
import { usersAdapter, UsersState } from './users.reducer';
import { selectFilteredUsers, selectPaginatedUsers } from './users.selectors';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Ana Silva',
  email: 'ana@email.com',
  cpf: '529.982.247-25',
  phone: '(11) 91234-5678',
  phoneType: 'Celular',
  status: 'Ativo',
  address: {
    cep: '01001-000',
    street: 'Praca da Se',
    number: '100',
    neighborhood: 'Se',
    city: 'Sao Paulo',
    state: 'SP',
    complement: ''
  },
  ...overrides
});

const buildState = (users: User[]): { users: UsersState } => {
  const initialState: UsersState = usersAdapter.getInitialState({
    loading: false,
    error: null
  });
  const state: UsersState = usersAdapter.setAll(users, initialState);

  return { users: state };
};

describe('users selectors', () => {
  it('should filter users by name', () => {
    const state = buildState([
      buildUser({ id: '1', name: 'Ana Silva' }),
      buildUser({ id: '2', name: 'Bruno Costa' })
    ]);

    const result = selectFilteredUsers('ana')(state);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ana Silva');
  });

  it('should paginate users', () => {
    const state = buildState([
      buildUser({ id: '1', name: 'Ana Silva' }),
      buildUser({ id: '2', name: 'Bruno Costa' }),
      buildUser({ id: '3', name: 'Carla Dias' })
    ]);

    const result = selectPaginatedUsers('', 1, 1)(state);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bruno Costa');
  });
});
