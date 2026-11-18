import { Routes } from '@angular/router';
import { JobFeed } from './features/jobs/job-feed/job-feed';
import { JobForm } from './features/jobs/job-form/job-form';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'jobs', component: JobFeed },
  { path: 'jobs/new', component: JobForm },
  { path: 'jobs/:id/edit', component: JobForm },
];