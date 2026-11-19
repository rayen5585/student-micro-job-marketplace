import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth.guard';

// Route de Student 1 : profil
export const PROFILE_ROUTES: Routes = [
  {
    path: 'profile',
    canActivate: [authGuard], // le guard bloque la page si on n'est pas connecté
    loadComponent: () => import('./student-profile/student-profile').then(m => m.StudentProfile)
  }
];
