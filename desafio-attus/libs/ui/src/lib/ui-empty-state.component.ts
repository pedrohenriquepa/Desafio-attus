import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './ui-empty-state.component.html',
  styleUrl: './ui-empty-state.component.scss'
})
export class UiEmptyStateComponent {
  @Input() title = 'Nada por aqui';
  @Input() message = 'Tente ajustar o filtro para encontrar usuarios.';
  @Input() icon = 'search_off';
}
