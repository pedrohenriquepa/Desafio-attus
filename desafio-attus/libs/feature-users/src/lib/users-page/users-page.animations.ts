import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const usersListAnimation = trigger('usersListAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        stagger(60, [
          animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ],
      { optional: true }
    )
  ])
]);
