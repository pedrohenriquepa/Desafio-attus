import { describe, expect, it } from 'vitest';

import { User } from '../models/user.model';
import * as UsersActions from './users.actions';
import { usersFeature } from './users.reducer';

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

const getState = () => usersFeature.reducer(undefined, { type: '@@init' });

describe('users reducer', () => {
  it('should set loading on loadUsers', () => {
    const state = usersFeature.reducer(getState(), UsersActions.loadUsers());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should store users on loadUsersSuccess', () => {
    const users = [buildUser({ id: '1' }), buildUser({ id: '2' })];
    const state = usersFeature.reducer(
      getState(),
      UsersActions.loadUsersSuccess({ users })
    );

    expect(state.ids.length).toBe(2);
    expect(state.loading).toBe(false);
  });

  it('should store error on loadUsersError', () => {
    const state = usersFeature.reducer(
      getState(),
      UsersActions.loadUsersError({ error: 'Erro' })
    );

    expect(state.error).toBe('Erro');
    expect(state.loading).toBe(false);
  });

  it('should add user on addUserSuccess', () => {
    const user = buildUser();
    const state = usersFeature.reducer(
      getState(),
      UsersActions.addUserSuccess({ user })
    );

    expect(state.ids).toContain(user.id);
  });

  it('should update user on updateUserSuccess', () => {
    const initial = usersFeature.reducer(
      getState(),
      UsersActions.loadUsersSuccess({ users: [buildUser()] })
    );

    const updated = buildUser({ name: 'Ana Paula' });
    const state = usersFeature.reducer(
      initial,
      UsersActions.updateUserSuccess({ user: updated })
    );

    expect(state.entities[updated.id]?.name).toBe('Ana Paula');
  });
});
