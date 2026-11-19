import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <span class="stars">
      @for (n of [1, 2, 3, 4, 5]; track n) {
        <button
          type="button"
          class="star"
          [class.on]="n <= (hover() || value())"
          [disabled]="locked()"
          (mouseenter)="hover.set(n)"
          (mouseleave)="hover.set(0)"
          (click)="valueChange.emit(n)"
        >★
        </button>
      }
    </span>
  `,
  styles: `
    .star, .star:hover:not(:disabled), .star:active:not(:disabled) {
      background: none; color: #d1d5db; font-size: 22px; padding: 0 2px; transform: none;
    }
    .star.on, .star.on:hover:not(:disabled) { color: #f59e0b; }
    .star:disabled { opacity: 1; cursor: default; }
  `,
})
export class StarRating {
  value = input(0);
  locked = input(false);          // true = affichage bark (bla click)
  valueChange = output<number>();
  hover = signal(0);
}