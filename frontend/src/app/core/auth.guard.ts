import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Guard fonctionnel : il décide si Angular a le droit d'ouvrir une page
// Il renvoie true (accès autorisé) ou un UrlTree (redirection vers une autre page)
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  // Côté serveur (SSR) localStorage n'existe pas : on laisse passer, le navigateur refera la vérification
  if (typeof localStorage === 'undefined') {
    return true;
  }

  // Un jeton est présent : l'utilisateur est connecté, on autorise la page
  if (localStorage.getItem('token')) {
    return true;
  }

  // Pas de jeton : on bloque la page et on redirige vers la connexion
  return router.createUrlTree(['/sign-in']);
};
