import { Routes } from '@angular/router';

export const PROPOSAL_ROUTES: Routes = [
  {
    path: 'new/:jobId',
    loadComponent: () =>
      import('./proposal-form/proposal-form').then((m) => m.ProposalForm),
  },
  {
    path: 'job/:jobId',
    loadComponent: () =>
      import('./job-proposals/job-proposals').then((m) => m.JobProposals),
  },
  {
    path: 'mine',
    loadComponent: () =>
      import('./my-proposals/my-proposals').then((m) => m.MyProposals),
  },
];