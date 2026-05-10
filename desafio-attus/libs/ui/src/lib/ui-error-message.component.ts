import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-error-message',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './ui-error-message.component.html',
  styleUrl: './ui-error-message.component.scss'
})
export class UiErrorMessageComponent {
  @Input() message = 'Algo deu errado.';
  @Output() retry = new EventEmitter<void>();
}
