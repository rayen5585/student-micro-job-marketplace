import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../job.service';
import { Job } from '../job.model';
import { CurrentUser } from '../../../core/current-user';

@Component({
  selector: 'app-job-list',
  imports: [DatePipe, RouterLink],
  template: `
    <div class="head">
      <h2>💼 Available Jobs</h2>
      @if (currentUser.isClient) {
        <a class="btn" routerLink="/jobs/new">+ Post a Job</a>
      }
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (jobs().length === 0 && !loading()) {
      <p>No jobs posted yet. Be the first!</p>
    }

    @if (loading()) {
      <p>Loading...</p>
    }

    @for (j of jobs(); track j.id) {
      <article class="card">
        <header>
          <strong>{{ j.title }}</strong>
          <span class="budget">{{ j.budget }} TND</span>
        </header>

        <p class="desc">{{ j.description }}</p>

        <div class="tags">
          @for (s of j.skills; track s) {
            <span class="chip">{{ s }}</span>
          }
          @if (!j.deadline) {
            <span class="chip muted">No deadline</span>
          } @else {
            <span class="chip deadline">📅 {{ j.deadline | date: 'mediumDate' }}</span>
          }
        </div>

        <footer>
          <small>Posted {{ j.createdAt | date: 'mediumDate' }}</small>
          <div class="actions">
            @if (canPitch(j)) {
              <a class="btn-sm" [routerLink]="['/proposals/new', j.id]">Send a Pitch</a>
            }
            @if (canManage(j)) {
              <a class="btn-sm outline" [routerLink]="['/proposals/job', j.id]">View Bids</a>
              <button class="danger sm" (click)="remove(j)">Delete</button>
            }
          </div>
        </footer>
      </article>
    }
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .btn { background: var(--primary); color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 600; }
    .btn:hover { background: var(--primary-dark); text-decoration: none; }
    header { display: flex; justify-content: space-between; align-items: center; }
    .budget { font-weight: 700; color: #2e7d32; }
    .desc { margin: 8px 0; color: var(--muted); white-space: pre-wrap; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
    .chip { background: #eee; color: #1f2937; border-radius: 12px; padding: 2px 10px; font-size: 12px; }
    .chip.muted { background: transparent; color: var(--muted); border: 1px dashed var(--border); }
    .chip.deadline { background: #fff3cd; }
    footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
    footer small { color: var(--muted); }
    .actions { display: flex; gap: 8px; align-items: center; }
    .btn-sm { background: var(--primary); color: #fff; padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; }
    .btn-sm:hover { background: var(--primary-dark); text-decoration: none; }
    .btn-sm.outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
    button.danger.sm { padding: 5px 10px; font-size: 13px; }
  `,
})
export class JobList implements OnInit {
  private service = inject(JobService);
  currentUser = inject(CurrentUser);

  jobs = signal<Job[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => { this.jobs.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message ?? 'Failed to load jobs'); this.loading.set(false); },
    });
  }

  /**
   * "Send a Pitch" todhher ken lel Freelancer w mouch 3la job mte3ou
   */
  canPitch(j: Job): boolean {
    return this.currentUser.isFreelancer && !this.currentUser.isOwner(j.postedBy);
  }

  /**
   * "View Bids" & "Delete" ma yodhrou ken lel Client li howa mhabet el job mte3ou
   */
  canManage(j: Job): boolean {
    return this.currentUser.isOwner(j.postedBy);
  }

  remove(j: Job) {
    if (!confirm(`Delete "${j.title}"? All its proposals will be deleted too.`)) return;
    this.service.remove(j.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message ?? 'Delete failed'),
    });
  }
}
