import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor fonctionnel : il s'exécute pour CHAQUE requête HTTP envoyée par Angular
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Côté serveur (SSR) localStorage n'existe pas, donc on vérifie avant de l'utiliser
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  // Pas de jeton (pas connecté) : on laisse passer la requête telle quelle
  if (!token) {
    return next(req);
  }

  // Une requête est immuable : on en crée une copie avec l'en-tête Authorization en plus
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq); // on envoie la copie au backend
};
