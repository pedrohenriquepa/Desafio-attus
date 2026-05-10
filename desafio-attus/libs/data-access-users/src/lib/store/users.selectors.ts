import { createSelector } from '@ngrx/store';

import { usersAdapter, usersFeature } from './users.reducer';

const { selectAll } = usersAdapter.getSelectors();

export const selectUsersState = usersFeature.selectUsersState;

export const selectAllUsers = createSelector(selectUsersState, selectAll);

export const selectLoading = createSelector(
  selectUsersState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectUsersState,
  (state) => state.error
);

export const selectFilteredUsers = (filter: string) =>
  createSelector(selectAllUsers, (users) => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) {
      return users;
    }

    return users.filter((user) =>
      user.name.toLowerCase().includes(normalized)
    );
  });

export const selectPaginatedUsers = (
  filter: string,
  pageIndex: number,
  pageSize: number
) =>
  createSelector(selectFilteredUsers(filter), (users) => {
    const start = pageIndex * pageSize;
    return users.slice(start, start + pageSize);
  });
