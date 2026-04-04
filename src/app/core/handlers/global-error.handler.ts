import { ErrorHandler, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export class GlobalErrorHandler implements ErrorHandler {
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  handleError(error: unknown): void {
    console.error('Global error handler:', error);

    // Обработка HTTP ошибок
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
      return;
    }

    // Обработка других ошибок
    this.handleGenericError(error);
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // Обработка ошибок авторизации
    if (error.status === 401 || error.status === 403) {
      this.authService.clearAuthData();
      this.showError('Сессия истекла. Пожалуйста, войдите снова.');
      return;
    }

    // Обработка ошибок валидации
    if (error.status === 400) {
      const validationError = error.error as { detail?: string; errors?: Record<string, string[]> };
      const message = validationError.detail || 'Ошибка валидации данных';
      this.showError(message);
      return;
    }

    // Обработка ошибок сервера
    if (error.status >= 500) {
      this.showError('Ошибка сервера. Пожалуйста, попробуйте позже.');
      return;
    }

    // Обработка других HTTP ошибок
    this.showError(error.message || 'Произошла ошибка');
  }

  private handleGenericError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Произошла непредвиденная ошибка';
    this.showError(errorMessage);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}