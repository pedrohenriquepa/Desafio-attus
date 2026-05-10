import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { provideState, provideStore, Store } from '@ngrx/store';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loadUsersError,
  loadUsersSuccess,
  usersFeature,
  User
} from '@desafio-attus/data-access-users';

import { UserDialogResult } from '../user-dialog/user-dialog.component';
import { UsersPageComponent } from './users-page.component';

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

describe('UsersPageComponent', () => {
  let fixture: ComponentFixture<UsersPageComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [provideStore(), provideState(usersFeature), provideNoopAnimations()]
    });

    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(null)
    } as unknown as MatDialogRef<unknown, UserDialogResult>);

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
  });

  it('should show loading spinner while loading', () => {
    const spinner = fixture.nativeElement.querySelector('ui-loading-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render error message when error exists', () => {
    store.dispatch(loadUsersError({ error: 'Falha' }));
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('ui-error-message');
    expect(error).toBeTruthy();
  });

  it('should filter users by name', () => {
    vi.useFakeTimers();

    store.dispatch(
      loadUsersSuccess({
        users: [
          buildUser({ id: '1', name: 'Ana Silva' }),
          buildUser({ id: '2', name: 'Bruno Costa' })
        ]
      })
    );

    fixture.detectChanges();
    fixture.componentInstance.filterControl.setValue('ana');
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('ui-card');
    expect(cards.length).toBe(1);

    vi.useRealTimers();
  });

  it('should paginate users', async () => {
    vi.useFakeTimers();

    store.dispatch(
      loadUsersSuccess({
        users: [
          buildUser({ id: '1', name: 'Ana Silva' }),
          buildUser({ id: '2', name: 'Bruno Costa' })
        ]
      })
    );

    fixture.detectChanges();
    const initialPagePromise = firstValueFrom(fixture.componentInstance.paginatedUsers$);
    vi.advanceTimersByTime(300);
    const initialPage = await initialPagePromise;
    expect(initialPage).toHaveLength(2);

    const event: PageEvent = {
      pageIndex: 1,
      pageSize: 1,
      length: 2,
      previousPageIndex: 0
    };

    fixture.componentInstance.onPageChange(event);
    const pagedResultPromise = firstValueFrom(fixture.componentInstance.paginatedUsers$);
    vi.advanceTimersByTime(300);
    const pagedResult = await pagedResultPromise;

    expect(pagedResult).toHaveLength(1);
    expect(pagedResult[0].name).toBe('Bruno Costa');
    vi.useRealTimers();
  });
});
