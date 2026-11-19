import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

// All routes from all students merged.
// Auth pages (Khoubaib / Student 1) are at the root level, no layout wrapper.
// Main app pages (Rayen / Students 2-4) use the client layout wrapper at root '' path.
// Admin pages use the admin layout.
export const routes: Routes = [
  // ── Student 1 (Khoubaib): Auth & onboarding ─────────────────────────────────
  { path: 'sign-in', loadComponent: () => import('./features/auth/sign-in/sign-in').then(m => m.SignIn) },
  { path: 'sign-up', loadComponent: () => import('./features/auth/sign-up/sign-up').then(m => m.SignUp) },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/student-profile/student-profile').then(m => m.StudentProfile),
  },
  {
    path: 'role',
    canActivate: [authGuard],
    loadComponent: () => import('./features/role/role-choice/role-choice').then(m => m.RoleChoice),
  },
  {
    path: 'client',
    canActivate: [authGuard],
    loadComponent: () => import('./features/role/client-placeholder/client-placeholder').then(m => m.ClientPlaceholder),
  },

  // ── Students 2/3/4 (Rayen): Main app with client layout ─────────────────────
  {
    path: '',
    loadComponent: () => import('./core/layout/client-layout/client-layout').then(m => m.ClientLayout),
    children: [
      // Default landing redirects to sign-in if no token (guard handles it),
      // or shows home if authenticated
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },

      // Jobs CRUD
      {
        path: 'jobs',
        canActivate: [authGuard],
        loadComponent: () => import('./features/jobs/job-list/job-list').then(m => m.JobList),
      },
      {
        path: 'jobs/new',
        canActivate: [authGuard],
        loadComponent: () => import('./features/jobs/job-form/job-form').then(m => m.JobForm),
      },

      // Proposals
      {
        path: 'proposals',
        canActivate: [authGuard],
        loadChildren: () => import('./features/proposals/proposals.routes').then(m => m.PROPOSAL_ROUTES),
      },

      // Search
      {
        path: 'search',
        loadComponent: () => import('./features/search/job-search/job-search').then(m => m.JobSearch),
      },
    ],
  },

  // ── Admin panel ──────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./core/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users').then(m => m.AdminUsers),
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/admin/jobs/admin-jobs').then(m => m.AdminJobs),
      },
      {
        path: 'proposals',
        loadComponent: () => import('./features/admin/proposals/admin-proposals').then(m => m.AdminProposals),
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'sign-in' },
];
