import { HttpInterceptorFn } from '@angular/common/http';

// Bridge interceptor: reads the userId stored by either auth system.
// - Khoubaib's auth stores the student id as 'studentId' in localStorage
// - Rayen's dev workflow stores it as 'userId'
// Either way, we forward it as the x-user-id header for Rayen's backend routes.
export const devUserInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('studentId') ?? localStorage.getItem('userId');
  if (!userId) return next(req);
  return next(req.clone({ setHeaders: { 'x-user-id': userId } }));
};
