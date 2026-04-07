import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Не добавляем токен для запросов на логин и logout
  const isAuthRequest = req.url.includes('/login')
    || req.url.includes('/logout')
    || req.url.includes('/refresh');

  const token = authService.accessToken();
  const authReq = isAuthRequest
    ? req
    : token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        handleUnauthorizedError(authService, router);
      }
      return throwError(() => error);
    }),
  );
};

function handleUnauthorizedError(authService: AuthService, router: Router): void {
  authService.clearAuthData();
  router.navigate(['/login']);
}