import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  host: {
    class: 'main-header',
  },
  template: `
    <div class="header-content">
      <h1 class="header-title">{{ title }}</h1>
      <button mat-button class="profile-button" [mat-menu-trigger-for]="profileMenu">
        <mat-icon>account_circle</mat-icon>
        Профиль
      </button>
      <mat-menu #profileMenu="matMenu" xPosition="before">
        <button mat-menu-item (click)="onLogoutClick()">
          <mat-icon>logout</mat-icon>
          Выйти
        </button>
      </mat-menu>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      min-height: 64px;
    }

    .header-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #1976d2;
    }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .profile-button mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0.75rem 1rem;
      }

      .header-title {
        font-size: 1.25rem;
      }

      .profile-button span {
        display: none;
      }

      .profile-button mat-icon {
        width: 1.75rem;
        height: 1.75rem;
      }
    }
  `,
})
export class MainHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly title = 'АИС ОГПА';

  onLogoutClick(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.snackBar.open('Вы вышли из системы', 'Закрыть', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        void this.router.navigate(['/login']);
      },
      error: () => {
        // Ошибка игнорируется, так как мы всё равно перенаправляем на login
        void this.router.navigate(['/login']);
      },
    });
  }
}