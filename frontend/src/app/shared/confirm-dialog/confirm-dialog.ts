import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="backdrop" (click)="cancelled.emit()">
      <div class="box" (click)="$event.stopPropagation()">
        <h3>{{ title() }}</h3>
        <p>{{ message() }}</p>
        <div class="actions">
          <button class="ghost" (click)="cancelled.emit()">Cancel</button>
          <button [class.danger]="danger()" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
      display: grid; place-items: center; z-index: 1000; padding: 16px;
    }
    .box {
      background: var(--card, #fff); color: var(--text, #1f2937);
      border-radius: 16px; padding: 24px; width: 100%; max-width: 420px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    }
    h3 { margin: 0 0 8px; }
    p { margin: 0 0 20px; color: var(--muted, #6b7280); }
    .actions { display: flex; justify-content: flex-end; gap: 8px; }
    .ghost, .ghost:hover:not(:disabled) { background: transparent; color: var(--text, #1f2937); border: 1px solid var(--border, #e5e7eb); }
  `,
})
export class ConfirmDialog {
  title = input('Are you sure?');
  message = input('');
  confirmLabel = input('Confirm');
  danger = input(false);

  confirmed = output<void>();
  cancelled = output<void>();
}