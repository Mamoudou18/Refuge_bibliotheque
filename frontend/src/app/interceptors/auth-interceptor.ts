import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { getToken, removeToken, removeMembre } from '../utils/token.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  const router = inject(Router);

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        removeToken();
        removeMembre();
        router.navigate(['/connexion'], {
          queryParams: { sessionExpired: true }
        });
      }
      return throwError(() => error);
    })
  );
};