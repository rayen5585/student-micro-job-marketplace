import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { Proposal } from '../../proposals/proposal.model';

@Component({
  selector: 'app-admin-proposals',
  imports: [DatePipe],
  template: `
    <div class="head">
      <h2>📨 Proposals ({{ proposals().length }})</h2>
      <label>
        Status
        <select (change)="setFilter($any($event.target).value)">
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
    </div>
    @if (error()) { <p class="error">{{ error() }}</p> }

    <table class="table">
      <thead>
        <tr><th>ID</th><th>Job</th><th>Freelancer</th><th>Price</th><th>Days</th><th>Status</th><th>Date</th><th></th></tr>
      </thead>
      <tbody>
        @for (p of proposals(); track p.id) {
          <tr>
            <td>{{ p.id }}</td>
            <td>{{ p.job?.title }}</td>
            <td>{{ p.freelancer?.name }}</td>
            <td>{{ p.price }} TND</td>
            <td>{{ p.deliveryDays }}</td>
            <td><span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span></td>
            <td>{{ p.createdAt | date: 'mediumDate' }}</td>
            <td><button class="danger" (click)="remove(p)">Delete</button></td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `.head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }`,
})
export class AdminProposals implements OnInit {
  private service = inject(AdminService);
  proposals = signal<Proposal[]>([]);
  error = signal('');
  private status = '';

  ngOnInit() { this.load(); }

  load() {
    this.service.proposals(this.status).subscribe({
      next: (d) => this.proposals.set(d),
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load proposals'),
    });
  }

  setFilter(status: string) {
    this.status = status;
    this.load();
  }

  remove(p: Proposal) {
    if (!confirm(`Delete proposal #${p.id}?`)) return;
    this.service.deleteProposal(p.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message ?? 'Delete failed'),
    });
  }
}