import { Routes } from '@angular/router';

export const routes: Routes = [
  // ... routes mta3 el ba9i (khallihom)
  {
    path: 'proposals',
    loadChildren: () =>
      import('./features/proposals/proposals.routes').then((m) => m.PROPOSAL_ROUTES),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/job-search/job-search').then((m) => m.JobSearch),
  },
];