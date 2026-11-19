import { Routes } from '@angular/router';

// Routes de Student 1 : connexion et inscription
export const AUTH_ROUTES: Routes = [
  { path: 'sign-in', loadComponent: () => import('./sign-in/sign-in').then(m => m.SignIn) },
  { path: 'sign-up', loadComponent: () => import('./sign-up/sign-up').then(m => m.SignUp) }
];
