import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { AdminStats } from '../admin.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe],
  template: `
    @if (error()) { <p class="error">{{ error() }}</p> }

    @if (stats(); as s) {
      <div class="cards">
        <div class="stat">
          <div class="top"><span>Total Revenue</span><i class="ico orange">💰</i></div>
          <b>{{ s.completedValue }} TND</b>
          <small>From completed gigs</small>
        </div>
        <div class="stat">
          <div class="top"><span>Total Jobs</span><i class="ico violet">💼</i></div>
          <b>{{ s.jobs }}</b>
          <small>{{ s.totalBudget }} TND total budget</small>
        </div>
        <div class="stat">
          <div class="top"><span>Total Proposals</span><i class="ico green">📨</i></div>
          <b>{{ s.proposals }}</b>
          <small>{{ s.byStatus['Pending'] }} pending</small>
        </div>
        <div class="stat">
          <div class="top"><span>Total Users</span><i class="ico blue">👥</i></div>
          <b>{{ s.users }}</b>
          <small>{{ s.admins }} admin(s)</small>
        </div>
      </div>

      <div class="row2">
        <section class="panel">
          <div class="head">
            <h3>Performance</h3>
            <div class="legend">
              <span><i class="dot orange"></i>Proposals</span>
              <span><i class="dot teal"></i>Jobs</span>
            </div>
          </div>

          @if (chart(); as c) {
            <svg [attr.viewBox]="'0 0 ' + c.W + ' ' + (c.H + 26)" class="chart">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#fdba74" />
                  <stop offset="100%" stop-color="#ea580c" />
                </linearGradient>
              </defs>

              @for (g of [0.25, 0.5, 0.75, 1]; track g) {
                <line x1="0" [attr.x2]="c.W" [attr.y1]="c.H - g * (c.H - 20)" [attr.y2]="c.H - g * (c.H - 20)"
                      stroke="#2a2c36" stroke-dasharray="4 4" />
              }

              @for (b of c.bars; track b.label + $index) {
                <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h"
                      rx="4" fill="url(#barGrad)">
                  <title>{{ b.label }}: {{ b.v }} proposal(s)</title>
                </rect>
                <text [attr.x]="b.x + b.w / 2" [attr.y]="c.H + 18" text-anchor="middle"
                      fill="#9ca3af" font-size="11">{{ b.label }}</text>
              }

              <polyline [attr.points]="c.pts" fill="none" stroke="#14b8a6" stroke-width="2.5"
                        stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          }
        </section>

        <section class="panel">
          <div class="head"><h3>Conversions</h3></div>

          @if (gauge(); as g) {
            <svg viewBox="0 0 220 125" class="gauge">
              @for (seg of g.segs; track $index) {
                <line [attr.x1]="seg.x1" [attr.y1]="seg.y1" [attr.x2]="seg.x2" [attr.y2]="seg.y2"
                      stroke-width="9" stroke-linecap="round"
                      [attr.stroke]="seg.on ? '#fb923c' : '#2a2c36'" />
              }
              <text x="110" y="100" text-anchor="middle" fill="#fff" font-size="28" font-weight="800">{{ g.rate }}%</text>
              <text x="110" y="118" text-anchor="middle" fill="#9ca3af" font-size="10">proposals accepted</text>
            </svg>
          }

          <div class="mini">
            <div><small>Accepted</small><b>{{ s.byStatus['Accepted'] }}</b></div>
            <div><small>Completed</small><b>{{ s.byStatus['Completed'] }}</b></div>
            <div><small>Rejected</small><b>{{ s.byStatus['Rejected'] }}</b></div>
          </div>
        </section>
      </div>

      <div class="row3">
        <section class="panel">
          <div class="head"><h3>Top jobs</h3></div>
          @for (j of s.topJobs; track j.id) {
            <div class="line"><span>{{ j.title }}</span><b>{{ j.bidsCount }} bid(s)</b></div>
          }
          @if (s.topJobs.length === 0) { <small>No jobs yet.</small> }
        </section>

        <section class="panel">
          <div class="head"><h3>Latest proposals</h3></div>
          <table class="table">
            <thead><tr><th>Job</th><th>Freelancer</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              @for (p of s.recentProposals; track p.id) {
                <tr>
                  <td>{{ p.job?.title }}</td>
                  <td>{{ p.freelancer?.name }}</td>
                  <td>{{ p.price }} TND</td>
                  <td><span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span></td>
                  <td>{{ p.createdAt | date: 'shortDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
          @if (s.recentProposals.length === 0) { <small>No proposals yet.</small> }
        </section>
      </div>
    }
  `,
  styles: `
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .stat {
      background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 18px;
      display: flex; flex-direction: column; gap: 6px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .stat:hover { transform: translateY(-4px); border-color: var(--primary); }
    .top { display: flex; justify-content: space-between; align-items: center; color: var(--muted); font-size: 14px; }
    .stat b { font-size: 28px; }
    .stat small { color: var(--muted); }
    .ico { font-style: normal; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; }
    .ico.orange { background: rgba(249, 115, 22, 0.2); }
    .ico.violet { background: rgba(139, 92, 246, 0.2); }
    .ico.green  { background: rgba(34, 197, 94, 0.2); }
    .ico.blue   { background: rgba(59, 130, 246, 0.2); }

    .row2 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }
    .row3 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
    @media (max-width: 1000px) { .row2, .row3 { grid-template-columns: 1fr; } }

    .panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 18px; min-width: 0; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .head h3 { margin: 0; }
    .legend { display: flex; gap: 14px; font-size: 12px; color: var(--muted); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .dot.orange { background: #fb923c; } .dot.teal { background: #14b8a6; }

    .chart { width: 100%; height: auto; }
    .chart rect { transition: opacity 0.15s; }
    .chart rect:hover { opacity: 0.75; }
    .gauge { width: 100%; max-width: 260px; display: block; margin: 0 auto; }

    .mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
    .mini div { background: #14151a; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; }
    .mini small { color: var(--muted); font-size: 11px; }

    .line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--border); }
  `,
})
export class AdminDashboard implements OnInit {
  private service = inject(AdminService);
  stats = signal<AdminStats | null>(null);
  error = signal('');

  chart = computed(() => {
    const s = this.stats();
    if (!s) return null;
    const W = 600, H = 220;
    const n = s.byMonth.length;
    const step = W / n;
    const max = Math.max(1, ...s.byMonth.map((m) => m.proposals), ...s.byMonth.map((m) => m.jobs));

    const bars = s.byMonth.map((m, i) => {
      const h = (m.proposals / max) * (H - 20);
      return { x: i * step + step * 0.2, w: step * 0.6, y: H - h, h, label: m.label, v: m.proposals };
    });
    const pts = s.byMonth
      .map((m, i) => `${(i * step + step / 2).toFixed(1)},${(H - (m.jobs / max) * (H - 20)).toFixed(1)}`)
      .join(' ');

    return { W, H, bars, pts };
  });

  gauge = computed(() => {
    const s = this.stats();
    if (!s) return null;
    const won = (s.byStatus['Accepted'] || 0) + (s.byStatus['Completed'] || 0);
    const rate = s.proposals ? Math.round((won / s.proposals) * 100) : 0;

    const N = 14;
    const lit = Math.round((rate / 100) * N);
    const cx = 110, cy = 108, r1 = 62, r2 = 90;
    const segs = Array.from({ length: N }, (_, i) => {
      const a = Math.PI + (i * Math.PI) / (N - 1);
      return {
        x1: +(cx + r1 * Math.cos(a)).toFixed(1),
        y1: +(cy + r1 * Math.sin(a)).toFixed(1),
        x2: +(cx + r2 * Math.cos(a)).toFixed(1),
        y2: +(cy + r2 * Math.sin(a)).toFixed(1),
        on: i < lit,
      };
    });
    return { rate, segs };
  });

  ngOnInit() {
    this.service.stats().subscribe({
      next: (s) => this.stats.set(s),
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load stats'),
    });
  }
}