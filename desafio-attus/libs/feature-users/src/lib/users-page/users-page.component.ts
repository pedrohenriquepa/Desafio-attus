import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { debounceTime, filter, map, of, startWith, switchMap } from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  addUser,
  addUserSuccess,
  loadUsers,
  selectError,
  selectFilteredUsers,
  selectLoading,
  selectPaginatedUsers,
  updateUser,
  updateUserSuccess,
  User
} from '@desafio-attus/data-access-users';
import { UiCardComponent, UiEmptyStateComponent, UiErrorMessageComponent, UiLoadingSpinnerComponent } from '@desafio-attus/ui';

import { UserDialogComponent, UserDialogResult } from '../user-dialog/user-dialog.component';
import { usersListAnimation } from './users-page.animations';

interface PageState {
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'feature-users-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSnackBarModule,
    UiCardComponent,
    UiLoadingSpinnerComponent,
    UiEmptyStateComponent,
    UiErrorMessageComponent
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  animations: [usersListAnimation]
})
export class UsersPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  readonly filterControl = new FormControl('', { nonNullable: true });
  private readonly pageState$ = new BehaviorSubject<PageState>({
    pageIndex: 0,
    pageSize: 10
  });

  readonly filter$ = this.filterControl.valueChanges.pipe(
    startWith(this.filterControl.value),
    debounceTime(300),
    map((value) => value.trim()),
    switchMap((value) => of(value))
  );

  readonly filteredUsers$ = this.filter$.pipe(
    switchMap((filter) => this.store.select(selectFilteredUsers(filter)))
  );

  readonly paginatedUsers$ = combineLatest([this.filter$, this.pageState$]).pipe(
    switchMap(([filter, page]) =>
      this.store.select(
        selectPaginatedUsers(filter, page.pageIndex, page.pageSize)
      )
    )
  );

  readonly totalCount$ = this.filteredUsers$.pipe(
    map((users) => users.length)
  );

  readonly loading$ = this.store.select(selectLoading);
  readonly error$ = this.store.select(selectError);

  ngOnInit(): void {
    this.store.dispatch(loadUsers());

    this.filter$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const current = this.pageState$.value;
        this.pageState$.next({
          pageIndex: 0,
          pageSize: current.pageSize
        });
      });

    this.actions$
      .pipe(
        ofType(addUserSuccess, updateUserSuccess),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((action) => {
        const message = action.type.includes('Add')
          ? 'Usuario cadastrado com sucesso.'
          : 'Usuario atualizado com sucesso.';
        this.snackBar.open(message, 'Fechar', { duration: 2500 });
      });
  }

  openCreateDialog(): void {
    this.openDialog();
  }

  openEditDialog(user: User): void {
    this.openDialog(user);
  }

  onPageChange(event: PageEvent): void {
    this.pageState$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  retryLoad(): void {
    this.store.dispatch(loadUsers());
  }

  getInitials(name: string): string {
    const parts = name.split(' ').filter((part) => part.trim().length > 0);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase());
    return initials.join('');
  }

  private openDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '720px',
      maxWidth: '92vw',
      data: user ? { user } : null
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result): result is UserDialogResult => !!result),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result.mode === 'create') {
          this.store.dispatch(addUser({ user: result.user }));
        } else {
          this.store.dispatch(updateUser({ user: result.user }));
        }
      });
  }
}
