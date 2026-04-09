import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatListModule, RouterLink, RouterLinkActive],
  host: {
    class: 'app-sidenav',
  },
  template: `
    <nav class="sidenav-nav">
      <mat-nav-list>
        @for (item of menuItems; track item.route) {
          <a
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="sidenav-item"
          >
            {{ item.label }}
          </a>
        }
      </mat-nav-list>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--md-sys-color-surface);
    }

    .sidenav-nav {
      flex: 1;
      margin: 1rem 0 1rem 0.5rem;
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: 20px;
      border-right: 1px solid var(--md-sys-color-outline-variant);
    }

    .sidenav-item {
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      color: var(--md-sys-color-on-surface);
      font-weight: 700;
      transition: background-color 0.2s ease;
      cursor: pointer;
      line-height: 1.4;
    }

    ::ng-deep .sidenav-item {
      white-space: normal !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
      max-width: 100%;
    }

    ::ng-deep .sidenav-item .mdc-list-item__primary-text {
      white-space: normal !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
    }

    ::ng-deep .mdc-list-item.mdc-list-item--with-one-line {
      height: auto !important;
    }

    .sidenav-item:hover {
      background-color: var(--md-sys-color-surface-container-high);
    }

    ::ng-deep .sidenav-item.active {
      color: var(--md-sys-color-primary);
      font-weight: 700;

      .mdc-list-item__primary-text {
        color: var(--md-sys-color-primary);
      }
    }

    .sidenav-item.active:hover {
      background-color: var(--md-sys-color-surface-container-high);
    }
  `,
})
export class SidenavComponent {
  private readonly router = inject(Router);

  readonly menuItems: MenuItem[] = [
    { label: 'Пользователи', route: '/users' },
    { label: 'Уведомления и напоминания', route: '/notifications' },
    { label: 'Настройки АИС ОГПА', route: '/settings' },
    { label: 'Справочник погрузчиков', route: '/forklifts' },
    { label: 'Резервное копирование и восстановление', route: '/backup' },
    { label: 'Справочники', route: '/directories' },
    { label: 'Test Task', route: '/test-task' },
  ];
}