import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'ui-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: "<mat-progress-spinner class=\"spinner\" [diameter]=\"diameter\" mode=\"indeterminate\"></mat-progress-spinner>",
  styleUrl: './ui-loading-spinner.component.scss'
})
export class UiLoadingSpinnerComponent {
  @Input() diameter = 48;
}
