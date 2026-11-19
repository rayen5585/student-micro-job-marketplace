import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get('http://localhost:3000/api/admin/me').pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/']))) // mouch admin → yروح lel home
  );
};