import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { AdminUser } from '../admin.model';

@Component({
  selector: 'app-admin-users',
  imports: [DatePipe],
  template: `
    <h2>👥 Users ({{ users().length }})</h2>
    @if (error()) { <p class="error">{{ error() }}</p> }

    <table class="table">
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
      <tbody>
        @for (u of users(); track u.id) {
          <tr>
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select [value]="u.role" (change)="changeRole(u, $any($event.target).value)">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td>{{ u.createdAt | date: 'mediumDate' }}</td>
            <td><button class="danger" (click)="remove(u)">Delete</button></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class AdminUsers implements OnInit {
  private service = inject(AdminService);
  users = signal<AdminUser[]>([]);
  error = signal('');

  ngOnInit() { this.load(); }

  load() {
    this.service.users().subscribe({
      next: (d) => this.users.set(d),
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load users'),
    });
  }

  changeRole(u: AdminUser, role: 'user' | 'admin') {
    this.error.set('');
    this.service.setRole(u.id, role).subscribe({
      next: () => this.load(),
      error: (err) => { this.error.set(err.error?.message ?? 'Action failed'); this.load(); },
    });
  }

  remove(u: AdminUser) {
    if (!confirm(`Delete ${u.name}? Their jobs and proposals will be deleted too.`)) return;
    this.error.set('');
    this.service.deleteUser(u.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message ?? 'Delete failed'),
    });
  }
}