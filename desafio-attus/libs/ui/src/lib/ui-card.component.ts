import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [MatCardModule, NgIf],
  templateUrl: './ui-card.component.html',
  styleUrl: './ui-card.component.scss'
})
export class UiCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
