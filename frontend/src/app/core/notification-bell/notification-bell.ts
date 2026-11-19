import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SocialService } from '../../features/proposals/social.service';
import { AppNotification } from '../../features/proposals/proposal.model';

@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe],
  template: `
    <div class="bell">
      <button class="btn" (click)="toggle()">
        🔔
        @if (unread() > 0) {
          <span class="count">{{ unread() }}</span>
        }
      </button>

      @if (open()) {
        <div class="panel">
          <div class="head">
            <strong>Notifications</strong>
            @if (unread() > 0) {
              <button class="link" (click)="readAll()">Mark all as read</button>
            }
          </div>

          @for (n of items(); track n.id) {
            <div class="item" [class.unread]="!n.isRead" (click)="go(n)">
              <span>{{ n.message }}</span>
              <small>{{ n.createdAt | date: 'short' }}</small>
            </div>
          }
          @if (items().length === 0) {
            <p class="empty">No notifications yet.</p>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .bell { position: relative; }
    .btn, .btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.18); position: relative; padding: 6px 12px; }
    .count {
      position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff;
      border-radius: 999px; font-size: 11px; min-width: 18px; height: 18px;
      display: grid; place-items: center; padding: 0 4px;
    }
    .panel {
      position: absolute; right: 0; top: 44px; width: 320px; max-height: 420px; overflow-y: auto;
      background: var(--card, #fff); color: var(--text, #1f2937);
      border: 1px solid var(--border, #e5e7eb); border-radius: 12px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25); z-index: 50;
    }
    .head { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border, #e5e7eb); }
    .link, .link:hover:not(:disabled) { background: none; color: var(--primary, #4f46e5); padding: 0; font-size: 12px; }
    .item { padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; cursor: pointer; border-bottom: 1px solid var(--border, #e5e7eb); font-size: 14px; }
    .item:hover { background: rgba(127, 127, 127, 0.1); }
    .item.unread { background: rgba(79, 70, 229, 0.08); font-weight: 600; }
    .item small { color: var(--muted, #6b7280); font-weight: 400; }
    .empty { padding: 16px; margin: 0; color: var(--muted, #6b7280); text-align: center; }
  `,
})
export class NotificationBell implements OnInit, OnDestroy {
  private social = inject(SocialService);
  private router = inject(Router);

  items = signal<AppNotification[]>([]);
  unread = signal(0);
  open = signal(false);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.load();
    this.timer = setInterval(() => this.load(), 15000); // refresh kol 15 thenya
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  load() {
    if (!localStorage.getItem('userId')) return; // ma fama 7ata user mkhtar
    this.social.notifications().subscribe({
      next: (r) => {
        this.items.set(r.items);
        this.unread.set(r.unread);
      },
      error: () => {},
    });
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) this.load();
  }

  go(n: AppNotification) {
    this.open.set(false);
    if (!n.isRead) this.social.markRead(n.id).subscribe(() => this.load());
    if (n.link) this.router.navigateByUrl(n.link);
  }

  readAll() {
    this.social.markAllRead().subscribe(() => this.load());
  }
}