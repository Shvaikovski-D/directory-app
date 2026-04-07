import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { UsersService } from './users.service';
import { AccessTokenResponse, LoginRequest } from '../models/users.models';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  readonly accessToken = signal<string | null>(this.getStoredToken());
  readonly isAuthenticatedSignal = computed(() => this.accessToken() !== null);

  // Сигналы для управления обновлением токена
  private readonly isRefreshing = signal(false);
  private readonly refreshTokenSubject = signal<string | null>(null);

  login(credentials: LoginRequest): Observable<AccessTokenResponse> {
    return this.usersService.login(credentials).pipe(
      tap(response => this.handleSuccessfulLogin(response)),
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      }),
    );
  }

  logout(): Observable<never> {
    this.clearAuthData();
    
    return this.usersService.logout().pipe(
      catchError(error => {
        // Игнорируем ошибки при logout, так как токен уже удалён
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
  }

  refreshToken(): Observable<AccessTokenResponse> {
    const currentRefreshToken = this.getRefreshToken();

    // Если нет refresh токена - очищаем и редиректим
    if (!currentRefreshToken) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    // Если уже обновляем - возвращаем текущий новый токен или ошибку
    if (this.isRefreshing()) {
      const newToken = this.refreshTokenSubject();
      if (newToken) {
        // Если новый токен уже получен - возвращаем его
        return of({
          accessToken: newToken,
          refreshToken: currentRefreshToken, // Используем текущий refresh token
          expiresIn: 0, // Не важно, так как токен уже получен
        });
      }
      // Если обновление в процессе, но токен ещё не получен
      return throwError(() => new Error('Refresh in progress'));
    }

    // Начинаем обновление
    this.isRefreshing.set(true);
    this.refreshTokenSubject.set(null);

    return this.usersService.refresh({ refreshToken: currentRefreshToken }).pipe(
      tap(response => {
        this.handleSuccessfulLogin(response);
        this.refreshTokenSubject.set(response.accessToken);
      }),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/login']);
        this.refreshTokenSubject.set(null);
        return throwError(() => error);
      }),
      // Сбрасываем флаг обновления (успех или ошибка)
      tap({
        finalize: () => {
          this.isRefreshing.set(false);
        },
      }),
    );
  }

  // Геттеры для interceptor
  getIsRefreshing(): boolean {
    return this.isRefreshing();
  }

  getRefreshTokenSubject(): string | null {
    return this.refreshTokenSubject();
  }

  private handleSuccessfulLogin(response: AccessTokenResponse): void {
    sessionStorage.setItem(TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this.accessToken.set(response.accessToken);
  }

  private handleError(error: unknown): void {
    // Логируем ошибку
    console.error('Authentication error:', error);
  }

  clearAuthData(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
  }

  private getStoredToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.accessToken() !== null;
  }

  getRefreshToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }
}