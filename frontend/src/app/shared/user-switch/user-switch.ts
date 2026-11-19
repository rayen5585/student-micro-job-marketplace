import { Component, signal } from '@angular/core';
import { DEV_USERS } from '../../core/current-user';

@Component({
  selector: 'app-user-switch',
  template: `
    <label class="user-switch">
      Connected as
      <select (change)="setUser($any($event.target).value)">
        <option value="" [selected]="!currentUser()">-- choose --</option>
        @for (u of users; track u.id) {
          <option [value]="u.id" [selected]="currentUser() === u.id">{{ u.label }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    .user-switch { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    select { padding: 4px 8px; }
  `,
})
export class UserSwitch {
  users = DEV_USERS;

  currentUser = signal(localStorage.getItem('userId') ?? '');

  setUser(id: string) {
    localStorage.setItem('userId', id);
    this.currentUser.set(id);
    location.reload();
  }
}