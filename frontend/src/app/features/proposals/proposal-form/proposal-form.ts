import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposalService } from '../proposal.service';

@Component({
  selector: 'app-proposal-form',
  imports: [ReactiveFormsModule],
  template: `
    <h2>Submit your proposal</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Cover letter
        <textarea formControlName="coverLetter" rows="5"></textarea>
      </label>
      @if (f.coverLetter.touched && f.coverLetter.invalid) {
        <small class="error">Min 20 characters (max 2000).</small>
      }

      <label>
        Your price (TND)
        <input type="number" formControlName="price" />
      </label>
      @if (f.price.touched && f.price.invalid) {
        <small class="error">Price must be greater than 0.</small>
      }

      <label>
        Delivery time (days)
        <input type="number" formControlName="deliveryDays" />
      </label>
      @if (f.deliveryDays.touched && f.deliveryDays.invalid) {
        <small class="error">Enter a whole number of days (min 1).</small>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (success()) {
        <p class="success">Proposal sent ✅</p>
      }

      <button type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Sending...' : 'Send proposal' }}
      </button>
    </form>
  `,
  styles: `
    form { display: flex; flex-direction: column; gap: 12px; max-width: 500px; }
    label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; }
    .error { color: #c62828; }
    .success { color: #2e7d32; }
  `,
})
export class ProposalForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProposalService);

  jobId = Number(this.route.snapshot.paramMap.get('jobId'));
  loading = signal(false);
  error = signal('');
  success = signal(false);

  form = this.fb.nonNullable.group({
    coverLetter: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    price: [0, [Validators.required, Validators.min(1)]],
    deliveryDays: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
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

    this.service.create({ jobId: this.jobId, ...this.form.getRawValue() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/proposals/mine']), 1000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Something went wrong');
      },
    });
  }
}