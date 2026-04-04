import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SidenavComponent } from '../../shared/components/sidenav.component';
import { ForkliftsTableComponent } from './components/forklifts-table.component';
import { DowntimesSidebarComponent } from './components/downtimes-sidebar.component';
import { ForkliftsStore } from './forklifts.store';

@Component({
  selector: 'app-forklifts-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    SidenavComponent,
    ForkliftsTableComponent,
    DowntimesSidebarComponent,
  ],
  host: {
    class: 'forklifts-page',
  },
  template: `
    <div class="page-layout">
      <!-- Левая панель навигации -->
      <aside class="sidebar-left">
        <app-sidenav></app-sidenav>
      </aside>

      <!-- Центральная область -->
      <main class="main-content">
        <!-- Заголовок страницы -->
        <header class="page-header">
          <h1 class="page-title">Справочник погрузчиков</h1>
          
          <!-- Профиль пользователя -->
          <div class="user-profile">
            <button mat-button class="profile-button">
              <mat-icon>account_circle</mat-icon>
              Профиль
            </button>
          </div>
        </header>

        <!-- Панель фильтров -->
        <section class="filters-panel" aria-label="Фильтры погрузчиков">
          <div class="filter-row">
            <label for="search-number" class="filter-label">
              Номер погрузчика:
            </label>
            <input
              id="search-number"
              matInput
              class="filter-input"
              placeholder="Введите номер погрузчика"
              [(ngModel)]="searchNumber"
              (keyup.enter)="applySearch()"
              [attr.aria-label]="'Поиск по номеру погрузчика'"
            />
          </div>

          <div class="filter-actions">
            <button
              mat-button
              color="primary"
              (click)="applySearch()"
              [disabled]="!searchNumber.trim()"
              [attr.aria-label]="'Искать погрузчики'"
            >
              <mat-icon>search</mat-icon>
              Искать
            </button>
            <button
              mat-button
              (click)="resetFilter()"
              [disabled]="!searchNumber.trim()"
              [attr.aria-label]="'Сбросить фильтр'"
            >
              <mat-icon>refresh</mat-icon>
              Сбросить фильтр
            </button>
            <button
              mat-button
              color="primary"
              (click)="addForklift()"
              [disabled]="store.isEditing()"
              [attr.aria-label]="'Добавить новый погрузчик'"
            >
              <mat-icon>add</mat-icon>
              Добавить
            </button>
          </div>
        </section>

        <!-- Таблица погрузчиков -->
        <section class="table-section" aria-label="Таблица погрузчиков">
          <app-forklifts-table></app-forklifts-table>
        </section>
      </main>

      <!-- Правый сайдбар простоев -->
      <aside class="sidebar-right">
        <app-downtimes-sidebar></app-downtimes-sidebar>
      </aside>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .page-layout {
      display: flex;
      height: 100%;
      background-color: #fafafa;
    }

    .sidebar-left {
      width: 250px;
      flex-shrink: 0;
      border-right: 1px solid #e0e0e0;
      background-color: #f5f5f5;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: #ffffff;
    }

    .sidebar-right {
      width: 350px;
      flex-shrink: 0;
      border-left: 1px solid #e0e0e0;
      background-color: #fafafa;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1rem;
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
      color: #1976d2;
    }

    .user-profile {
      margin-left: auto;
    }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filters-panel {
      padding: 1.5rem 2rem;
      background-color: #f9f9f9;
      border-bottom: 1px solid #e0e0e0;
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-label {
      font-weight: 500;
      color: #333;
      min-width: 140px;
    }

    .filter-input {
      flex: 1;
      max-width: 400px;
      font-size: 0.95rem;
    }

    .filter-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .table-section {
      flex: 1;
      padding: 1.5rem 2rem;
      overflow: auto;
    }

    button[mat-button] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
    }

    button[mat-button] mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    @media (max-width: 1400px) {
      .sidebar-right {
        width: 300px;
      }
    }

    @media (max-width: 1200px) {
      .page-layout {
        flex-direction: column;
        overflow-y: auto;
      }

      .sidebar-left {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }

      .sidebar-right {
        width: 100%;
        border-left: none;
        border-top: 1px solid #e0e0e0;
      }

      .filter-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-label {
        min-width: auto;
      }

      .filter-input {
        max-width: 100%;
        width: 100%;
      }

      .filter-actions {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .user-profile {
        margin-left: 0;
      }

      .filter-actions {
        flex-direction: column;
      }

      .filter-actions button[mat-button] {
        width: 100%;
        justify-content: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftsPageComponent implements OnInit {
  readonly store = inject(ForkliftsStore);

  searchNumber = '';

  ngOnInit(): void {
    this.store.loadForklifts().subscribe();
  }

  applySearch(): void {
    this.store.searchByNumber(this.searchNumber);
  }

  resetFilter(): void {
    this.searchNumber = '';
    this.store.resetFilter();
  }

  addForklift(): void {
    this.store.startAdding();
  }
}