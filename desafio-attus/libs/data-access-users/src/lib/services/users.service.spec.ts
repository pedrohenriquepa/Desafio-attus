import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersService } from './users.service';

describe('UsersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return users after delay', async () => {
    vi.useFakeTimers();
    const service = TestBed.inject(UsersService);

    const promise = firstValueFrom(service.getUsers());
    vi.advanceTimersByTime(500);

    const users = await promise;
    expect(users.length).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
