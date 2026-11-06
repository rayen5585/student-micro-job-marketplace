import { HttpInterceptorFn } from '@angular/common/http';

export const devUserInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('userId');
  return next(userId ? req.clone({ setHeaders: { 'x-user-id': userId } }) : req);
};