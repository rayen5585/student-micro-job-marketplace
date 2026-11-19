import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../job.service';

@Component({
  selector: 'app-job-form',
  imports: [ReactiveFormsModule],
  template: `
    <h2>Post a New Job</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Title
        <input type="text" formControlName="title" placeholder="e.g. Logo Design" />
      </label>
      @if (f.title.touched && f.title.invalid) {
        <small class="error">Title must be at least 3 characters.</small>
      }

      <label>
        Description
        <textarea formControlName="description" rows="5" placeholder="Describe the task..."></textarea>
      </label>
      @if (f.description.touched && f.description.invalid) {
        <small class="error">Description must be at least 10 characters.</small>
      }

      <label>
        Budget (TND)
        <input type="number" formControlName="budget" min="1" />
      </label>
      @if (f.budget.touched && f.budget.invalid) {
        <small class="error">Budget must be greater than 0.</small>
      }

      <label>
        Skills (comma-separated, optional)
        <input type="text" formControlName="skillsRaw" placeholder="e.g. Angular, Node.js, Design" />
      </label>

      <label>
        Deadline (optional)
        <input type="date" formControlName="deadline" />
      </label>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (success()) {
        <p class="success">Job posted ✅</p>
      }

      <button type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Posting...' : 'Post Job' }}
      </button>
    </form>
  `,
  styles: `
    form { display: flex; flex-direction: column; gap: 12px; max-width: 560px; }
    label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; }
    .error { color: #c62828; }
    .success { color: #2e7d32; }
  `,
})
export class JobForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(JobService);

  loading = signal(false);
  error = signal('');
  success = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    budget: [0, [Validators.required, Validators.min(1)]],
    skillsRaw: [''],
    deadline: [''],
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const { title, description, budget, skillsRaw, deadline } = this.form.getRawValue();
    const skills = skillsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    this.service
      .create({ title, description, budget, skills, deadline: deadline || null })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/jobs']), 1000);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Something went wrong');
        },
      });
  }
}
