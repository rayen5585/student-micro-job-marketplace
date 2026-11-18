import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService } from '../job.service';

@Component({
  selector: 'app-job-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './job-form.html',
  styleUrl: './job-form.css',
})
export class JobForm implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  jobId: number | null = null;
  errorMessage = signal('');

  categories = ['Design', 'Programming', 'Writing', 'Translation', 'Tutoring', 'Other'];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    budget: [10, [Validators.required, Validators.min(5), Validators.max(1000)]],
    category: ['', Validators.required],
    deadline: ['', Validators.required],
  });

  get title() { return this.form.controls.title; }
  get description() { return this.form.controls.description; }
  get budget() { return this.form.controls.budget; }
  get category() { return this.form.controls.category; }
  get deadline() { return this.form.controls.deadline; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobId = Number(id);
      this.jobService.getJob(this.jobId).subscribe((job) => this.form.patchValue(job));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();
    const request = this.jobId
      ? this.jobService.updateJob(this.jobId, data)
      : this.jobService.createJob(data);

    request.subscribe({
      next: () => this.router.navigate(['/jobs']),
      error: (err) => {
        const errors: string[] | undefined = err.error?.errors;
        this.errorMessage.set(errors ? errors.join(' | ') : 'Server error, try again');
      },
    });
  }
}