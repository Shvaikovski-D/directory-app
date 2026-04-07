import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
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
    || req.url.includes('/register');

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
      if (error instanceof HttpErrorResponse) {
        // 401 - пытаемся обновить токен и повторить запрос
        if (error.status === 401 && !isAuthRequest) {
          return handle401Error(req, next, authService, router);
        }
        // 403 - запрещён доступ, редирект на login без попытки обновления
        if (error.status === 403) {
          authService.clearAuthData();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Обрабатывает ошибку 401 (Unauthorized)
 * Пытается обновить токен и повторить оригинальный запрос
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
): Observable<never> {
  // Если это запрос на refresh - не пытаемся обновить снова
  if (req.url.includes('/refresh')) {
    authService.clearAuthData();
    router.navigate(['/login']);
    return throwError(() => new Error('Refresh token failed'));
  }

  // Если токен уже обновляется - ждём завершения и повторяем запрос
  if (authService.getIsRefreshing()) {
    return authService.refreshToken().pipe(
      switchMap(() => {
        const newToken = authService.accessToken();
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next(clonedReq) as Observable<never>;
      }),
      catchError((err) => {
        // Ошибка при ожидании обновления - редирект на login
        return throwError(() => err);
      }),
    );
  }

  // Начинаем обновление токена
  return authService.refreshToken().pipe(
    switchMap(() => {
      const newToken = authService.accessToken();
      if (!newToken) {
        authService.clearAuthData();
        router.navigate(['/login']);
        return throwError(() => new Error('No new access token'));
      }

      // Повторяем оригинальный запрос с новым токеном
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      return next(clonedReq) as Observable<never>;
    }),
    catchError((err) => {
      // Ошибка при обновлении токена - уже обработана в authService.refreshToken()
      // Просто пробрасываем ошибку дальше
      return throwError(() => err);
    }),
  );
}