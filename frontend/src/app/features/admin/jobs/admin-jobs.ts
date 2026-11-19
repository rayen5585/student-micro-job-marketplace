import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { AdminJob } from '../admin.model';

@Component({
  selector: 'app-admin-jobs',
  imports: [DatePipe],
  template: `
    <h2>💼 Jobs ({{ jobs().length }})</h2>
    @if (error()) { <p class="error">{{ error() }}</p> }

    <table class="table">
      <thead>
        <tr><th>ID</th><th>Title</th><th>Owner</th><th>Budget</th><th>Skills</th><th>Bids</th><th>Deadline</th><th></th></tr>
      </thead>
      <tbody>
        @for (j of jobs(); track j.id) {
          <tr>
            <td>{{ j.id }}</td>
            <td>{{ j.title }}</td>
            <td>{{ j.ownerName ?? j.postedBy }}</td>
            <td>{{ j.budget }} TND</td>
            <td>{{ j.skills.join(', ') }}</td>
            <td>{{ j.bidsCount }}</td>
            <td>{{ j.deadline ? (j.deadline | date: 'mediumDate') : '—' }}</td>
            <td><button class="danger" (click)="remove(j)">Delete</button></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class AdminJobs implements OnInit {
  private service = inject(AdminService);
  jobs = signal<AdminJob[]>([]);
  error = signal('');

  ngOnInit() { this.load(); }

  load() {
    this.service.jobs().subscribe({
      next: (d) => this.jobs.set(d),
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load jobs'),
    });
  }

  remove(j: AdminJob) {
    if (!confirm(`Delete "${j.title}" and its ${j.bidsCount} bid(s)?`)) return;
    this.service.deleteJob(j.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message ?? 'Delete failed'),
    });
  }
}