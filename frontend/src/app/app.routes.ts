import { Routes } from '@angular/router';

// Chaque étudiant a son fichier de routes dans son dossier features/...
// Ici on ne fait que les brancher : une ligne par étudiant, donc peu de conflits Git.
export const routes: Routes = [
  // La redirection doit rester en premier, sinon la page d'accueil est vide
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES) },
  { path: '', loadChildren: () => import('./features/role/role.routes').then(m => m.ROLE_ROUTES) }
];
