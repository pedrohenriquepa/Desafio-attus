import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';

import { User } from '../models/user.model';
import * as UsersActions from './users.actions';

export const USERS_FEATURE_KEY = 'users';

export interface UsersState extends EntityState<User> {
  loading: boolean;
  error: string | null;
}

export const usersAdapter = createEntityAdapter<User>();

const initialState: UsersState = usersAdapter.getInitialState({
  loading: false,
  error: null
});

const reducer = createReducer(
  initialState,
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UsersActions.loadUsersSuccess, (state, { users }) =>
    usersAdapter.setAll(users, {
      ...state,
      loading: false,
      error: null
    })
  ),
  on(UsersActions.loadUsersError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(UsersActions.addUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UsersActions.addUserSuccess, (state, { user }) =>
    usersAdapter.addOne(user, {
      ...state,
      loading: false,
      error: null
    })
  ),
  on(UsersActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UsersActions.updateUserSuccess, (state, { user }) =>
    usersAdapter.updateOne(
      { id: user.id, changes: user },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  )
);

export const usersFeature = createFeature({
  name: USERS_FEATURE_KEY,
  reducer
});
