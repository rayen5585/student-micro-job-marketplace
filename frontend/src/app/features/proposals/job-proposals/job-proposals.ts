import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProposalService } from '../proposal.service';
import { Proposal, ProposalStatus } from '../proposal.model';

@Component({
  selector: 'app-job-proposals',
  imports: [DatePipe],
  template: `
    <h2>Bids on your job</h2>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    @if (proposals().length === 0 && !error()) {
      <p>No bids yet.</p>
    }

    @for (p of proposals(); track p.id) {
      <article class="card">
        <header>
          <strong>{{ p.freelancer?.name }}</strong>
          <span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span>
        </header>

        <p>{{ p.coverLetter }}</p>
        <p>
          <b>{{ p.price }} TND</b> • {{ p.deliveryDays }} day(s) •
          {{ p.createdAt | date: 'mediumDate' }}
        </p>

        @if (p.status === 'Pending') {
          <button (click)="setStatus(p, 'Accepted')">Accept</button>
          <button class="danger" (click)="setStatus(p, 'Rejected')">Reject</button>
        }
        @if (p.status === 'Accepted') {
          <button (click)="setStatus(p, 'Completed')">Mark as completed</button>
        }
      </article>
    }
  `,
  styles: `
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    header { display: flex; justify-content: space-between; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #eee; }
    .pending { background: #fff3cd; }
    .accepted { background: #d1e7dd; }
    .rejected { background: #f8d7da; }
    .completed { background: #cfe2ff; }
    button { margin-right: 8px; }
    .danger { background: #c62828; color: #fff; }
    .error { color: #c62828; }
  `,
})
export class JobProposals implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(ProposalService);

  jobId = Number(this.route.snapshot.paramMap.get('jobId'));
  proposals = signal<Proposal[]>([]);
  error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.listForJob(this.jobId).subscribe({
      next: (data) => {
        this.error.set('');
        this.proposals.set(data);
      },
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load bids'),
    });
  }

  setStatus(p: Proposal, status: ProposalStatus) {
    this.service.changeStatus(p.id, status).subscribe({
      next: () => this.load(), // reload: el baqi yمكن yetrefdhou automatiquement
      error: (err) => this.error.set(err.error?.message ?? 'Action failed'),
    });
  }
}