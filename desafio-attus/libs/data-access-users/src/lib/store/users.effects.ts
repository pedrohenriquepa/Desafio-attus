import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { UsersService } from '../services/users.service';
import * as UsersActions from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(() =>
        this.usersService.getUsers().pipe(
          map((users) => UsersActions.loadUsersSuccess({ users })),
          catchError(() =>
            of(
              UsersActions.loadUsersError({
                error: 'Nao foi possivel carregar os usuarios.'
              })
            )
          )
        )
      )
    )
  );

  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.addUser),
      switchMap(({ user }) =>
        this.usersService.addUser(user).pipe(
          map((saved) => UsersActions.addUserSuccess({ user: saved })),
          catchError(() =>
            of(
              UsersActions.loadUsersError({
                error: 'Nao foi possivel salvar o usuario.'
              })
            )
          )
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ user }) =>
        this.usersService.updateUser(user).pipe(
          map((saved) => UsersActions.updateUserSuccess({ user: saved })),
          catchError(() =>
            of(
              UsersActions.loadUsersError({
                error: 'Nao foi possivel atualizar o usuario.'
              })
            )
          )
        )
      )
    )
  );
}
