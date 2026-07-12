import { HttpInterceptorFn } from '@angular/common/http';
import { getToken } from '../utils/token.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};