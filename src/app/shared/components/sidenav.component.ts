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
      background-color: #f5f5f5;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .sidenav-item {
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      color: #333;
      transition: background-color 0.2s ease;
      cursor: pointer;
    }

    .sidenav-item:hover {
      background-color: #e8e8e8;
    }

    .sidenav-item.active {
      background-color: #1976d2;
      color: white;
      font-weight: 500;
    }

    .sidenav-item.active:hover {
      background-color: #1565c0;
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
  ];
}