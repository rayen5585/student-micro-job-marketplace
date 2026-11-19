import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth.guard';

// Routes de Student 1 : choix du rôle (Client ou Freelancer)
export const ROLE_ROUTES: Routes = [
  {
    path: 'role',
    canActivate: [authGuard], // il faut être connecté pour choisir son rôle
    loadComponent: () => import('./role-choice/role-choice').then(m => m.RoleChoice)
  },
  {
    // Page client : pour l'instant une page temporaire, à remplacer par celle de ton ami
    path: 'client',
    canActivate: [authGuard],
    loadComponent: () => import('./client-placeholder/client-placeholder').then(m => m.ClientPlaceholder)
  }
];
