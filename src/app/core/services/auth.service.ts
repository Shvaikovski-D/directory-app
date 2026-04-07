import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
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
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    return this.usersService.refresh({ refreshToken }).pipe(
      tap(response => this.handleSuccessfulLogin(response)),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
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