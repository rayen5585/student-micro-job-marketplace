import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserSwitch } from '../../../shared/user-switch/user-switch';
import { NotificationBell } from '../../notification-bell/notification-bell';
import { AdminService } from '../../../features/admin/admin.service';

@Component({
  selector: 'app-client-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserSwitch, NotificationBell],
  template: `
    <header class="navbar">
      <a routerLink="/" class="brand">🎓 Student Micro-Jobs</a>

      <nav>
        <a routerLink="/search" routerLinkActive="active">🔍 Find gigs</a>
        <a routerLink="/jobs" routerLinkActive="active">💼 Jobs</a>
        <a routerLink="/proposals/mine" routerLinkActive="active">📨 My proposals</a>
        @if (isAdmin()) {
          <a routerLink="/admin" class="admin-link">🛡️ Admin dashboard</a>
        }
      </nav>

      <app-notification-bell />
      <app-user-switch />
    </header>

    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: `
    .navbar {
      display: flex; align-items: center; gap: 24px; padding: 12px 24px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed); color: #fff;
      position: sticky; top: 0; z-index: 10; flex-wrap: wrap;
    }
    .brand { color: #fff; font-size: 18px; font-weight: 700; }
    .brand:hover { text-decoration: none; }
    nav { display: flex; gap: 8px; flex: 1; }
    nav a { color: #e0e7ff; padding: 6px 12px; border-radius: 8px; }
    nav a:hover { background: rgba(255, 255, 255, 0.15); text-decoration: none; }
    nav a.active { background: rgba(255, 255, 255, 0.25); color: #fff; }
    .admin-link { background: rgba(0, 0, 0, 0.25); color: #fff; }
  `,
})
export class ClientLayout implements OnInit {
  private admin = inject(AdminService);
  isAdmin = signal(false);

  ngOnInit() {
    this.admin.me().subscribe({
      next: () => this.isAdmin.set(true),
      error: () => this.isAdmin.set(false),
    });
  }
}