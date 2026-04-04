import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  host: {
    class: 'main-header',
  },
  template: `
    <div class="header-content">
      <h1 class="header-title">{{ title }}</h1>
      <button mat-button class="profile-button" (click)="onProfileClick()">
        <mat-icon>account_circle</mat-icon>
        Профиль
      </button>
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
  readonly title = 'АИС ОГПА';

  onProfileClick(): void {
    console.log('Профиль clicked');
    // TODO: Реализовать функционал профиля
  }
}