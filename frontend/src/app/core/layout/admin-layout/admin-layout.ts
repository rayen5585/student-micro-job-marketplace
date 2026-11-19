import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserSwitch } from '../../../shared/user-switch/user-switch';
import { AdminService } from '../../../features/admin/admin.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserSwitch],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="logo">M</span>
          <div>
            <strong>Micro-Jobs</strong>
            <small>Admin panel</small>
          </div>
        </div>

        <span class="section">NAVIGATION</span>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">📊 Overview</a>
          <a routerLink="/admin/users" routerLinkActive="active">👥 Users</a>
          <a routerLink="/admin/jobs" routerLinkActive="active">💼 Jobs</a>
          <a routerLink="/admin/proposals" routerLinkActive="active">📨 Proposals</a>
        </nav>

        <div class="clock">
          <b>{{ time() }}</b>
          <small>Local time</small>
        </div>

        <a routerLink="/" class="exit">⎋ Back to site</a>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="hello">
            <h1>Hi, {{ name() }}! Welcome back.</h1>
            <small>Manage your users, jobs and proposals in one place.</small>
          </div>

          <input class="search" type="search" placeholder="Search anything..." />

          <app-user-switch />
          <span class="avatar">{{ initial() }}</span>
        </header>

        <section class="content">
          <router-outlet />
        </section>
      </div>
    </div>
  `,
  styles: `
    .shell {
      --bg: #121317;
      --card: #1c1d24;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --border: #2a2c36;
      --primary: #f97316;
      --primary-dark: #ea580c;
      --accent: #14b8a6;
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      gap: 16px;
      padding: 16px;
    }
    @media (max-width: 860px) { .shell { grid-template-columns: 1fr; } }

    .sidebar {
      background: linear-gradient(180deg, #5b3a1f 0%, #3b2412 100%);
      border: 1px solid #6b4423;
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    }
    .brand {
      display: flex; align-items: center; gap: 12px;
      background: rgba(0, 0, 0, 0.35); border-radius: 14px; padding: 12px;
    }
    .brand small { display: block; color: #d6b38a; font-size: 11px; }
    .logo {
      width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center;
      background: linear-gradient(135deg, #fb923c, #ea580c); color: #fff; font-weight: 800;
    }
    .section {
      font-size: 11px; letter-spacing: 1px; color: #1b1208; font-weight: 800;
      background: #f5b66b; align-self: flex-start; padding: 2px 8px; border-radius: 4px;
    }
    nav { display: flex; flex-direction: column; gap: 8px; }
    nav a {
      color: #e5d3bd; background: rgba(0, 0, 0, 0.4);
      padding: 12px 14px; border-radius: 12px; border-left: 3px solid transparent;
      transition: transform 0.15s, background 0.15s;
    }
    nav a:hover { background: rgba(0, 0, 0, 0.6); text-decoration: none; transform: translateX(3px); }
    nav a.active { background: rgba(0, 0, 0, 0.7); border-left-color: #fb923c; color: #fff; }
    .clock {
      margin-top: auto; background: #0b0b0d; border-radius: 12px; padding: 12px;
      font-family: 'Consolas', monospace; color: #f5b66b;
    }
    .clock b { font-size: 24px; display: block; }
    .clock small { color: #8a7a66; }
    .exit {
      background: linear-gradient(180deg, #ef4444, #b91c1c); color: #fff; text-align: center;
      padding: 12px; border-radius: 12px; font-weight: 700;
    }
    .exit:hover { text-decoration: none; filter: brightness(1.1); }

    .main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
    .topbar {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 16px; padding: 12px 20px;
    }
    .hello { flex: 1; min-width: 220px; }
    .hello h1 { margin: 0; font-size: 18px; }
    .hello small { color: var(--muted); }
    .search { min-width: 200px; background: #14151a; border-radius: 999px; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
      background: linear-gradient(135deg, #fb923c, #ea580c); font-weight: 800; color: #fff;
    }
    .content { min-width: 0; }
  `,
})
export class AdminLayout implements OnInit, OnDestroy {
  private admin = inject(AdminService);

  name = signal('Admin');
  initial = computed(() => this.name().charAt(0).toUpperCase());
  time = signal(this.now());
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.admin.me().subscribe({ next: (u) => this.name.set(u.name) });
    this.timer = setInterval(() => this.time.set(this.now()), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private now() {
    return new Date().toLocaleTimeString('en-GB');
  }
}