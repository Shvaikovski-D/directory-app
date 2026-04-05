import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Вход в систему</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field class="full-width">
            <mat-label>Email</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              required
              autocomplete="email"
              aria-describedby="email-error"
            />
            @if (emailControl.touched && emailControl.invalid) {
              <mat-error id="email-error">
                @if (emailControl.hasError('required')) {
                  Email обязателен для заполнения
                } @else if (emailControl.hasError('email')) {
                  Введите корректный email
                }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field class="full-width">
            <mat-label>Пароль</mat-label>
            <input
              matInput
              type="password"
              formControlName="password"
              required
              autocomplete="current-password"
              aria-describedby="password-error"
            />
            @if (passwordControl.touched && passwordControl.invalid) {
              <mat-error id="password-error">
                Пароль обязателен для заполнения
              </mat-error>
            }
          </mat-form-field>

          <button
            type="submit"
            mat-raised-button
            color="primary"
            class="submit-button"
            [disabled]="isSubmitting() || loginForm.invalid"
            aria-label="Войти в систему"
          >
            @if (isSubmitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Войти
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%);
      padding: 1rem;
    }

    .login-card {
      background: var(--md-sys-color-surface);
      padding: 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 2rem 0;
      text-align: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 44px;
    }

    mat-spinner {
      margin: 0;
    }
  `,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected isSubmitting = signal(false);
  protected readonly isButtonDisabled = computed(
    () => this.isSubmitting() || this.loginForm.invalid,
  );

  protected readonly emailControl = this.loginForm.controls.email;
  protected readonly passwordControl = this.loginForm.controls.password;

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const credentials = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('Вход выполнен успешно', 'Закрыть', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        void this.router.navigate(['/forklifts']);
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);

        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            this.snackBar.open('Неверный email или пароль', 'Закрыть', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else if (error.status === 403) {
            this.snackBar.open('Доступ запрещён', 'Закрыть', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            this.snackBar.open(
              error.error?.detail || 'Ошибка при входе. Попробуйте позже.',
              'Закрыть',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
          }
        } else {
          this.snackBar.open('Ошибка при входе. Попробуйте позже.', 'Закрыть', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
    });
  }
}