import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../job.service';
import { Job } from '../job.model';

@Component({
  selector: 'app-job-feed',
  imports: [RouterLink, DatePipe],
  templateUrl: './job-feed.html',
  styleUrl: './job-feed.css',
})
export class JobFeed implements OnInit {
  private jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Cannot load jobs. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  deleteJob(id: number): void {
    if (!confirm('Delete this job?')) return;
    this.jobService.deleteJob(id).subscribe(() => this.loadJobs());
  }
}