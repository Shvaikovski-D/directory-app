import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
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
    ForkliftsTableComponent,
    DowntimesSidebarComponent,
  ],
  host: {
    class: 'forklifts-page',
  },
  template: `
    <div class="page-content">
      <!-- Заголовок страницы -->
      <h2 class="page-section-title">Справочник погрузчиков</h2>

      <!-- Панель фильтра -->
      <section class="filters-panel" aria-label="Фильтры погрузчиков">
        <div class="filter-row">
          <label for="search-number" class="filter-label">Filter:</label>
          <input
            id="search-number"
            matInput
            class="filter-input"
            placeholder="Номер погрузчика"
            [(ngModel)]="searchNumber"
            (keyup.enter)="applySearch()"
            [attr.aria-label]="'Поиск по номеру погрузчика'"
          />
          <button
            mat-button
            class="search-button"
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
            <mat-icon>clear</mat-icon>
            Сбросить
          </button>
        </div>
      </section>

      <div class="section-header">
        <button
          mat-button
          class="add-button"
          (click)="addForklift()"
          [disabled]="store.isEditing()"
          [attr.aria-label]="'Добавить новый погрузчик'"
        >
          Добавить
        </button>
      </div>

      <!-- Две секции: Погрузчики и Простои -->
      <div class="sections-container">
        <!-- Секция Погрузчики -->
        <section class="section-forklifts" aria-label="Погрузчики">
          <div class="section-content" style="display: flex; gap: 1.5rem;">
            <app-forklifts-table></app-forklifts-table>
          </div>
        </section>

        <!-- Секция Простои -->
        <section class="section-downtimes" aria-label="Простои">
          <div class="section-header in-column">
            <h3 class="section-title">
              <strong>Простои по погрузчику</strong> {{ selectedForkliftNumber() }}
            </h3>
            <button
              mat-button
              class="add-downtime-button"
              [attr.aria-label]="'Добавить новый простой'"
            >
              Добавить
            </button>
          </div>
          <div class="section-content">
            <app-downtimes-sidebar></app-downtimes-sidebar>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: 20px;
      padding: 1rem;
    }

    .page-section-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .filters-panel {
      padding: 1rem;
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    }

    .filter-input {
      min-width: 250px;
      max-width: 400px;
      font-size: 0.95rem;
    }

    .sections-container {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .section-forklifts,
    .section-downtimes {
      flex: 1;
      background-color: var(--md-sys-color-surface-container);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      overflow: hidden;
    }

    .section-forklifts {
      flex: 10;
    }

    .section-downtimes {
      flex: 7;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background-color: var(--md-sys-color-surface-container-high);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);

      &.in-column {
        flex-direction: column;
        gap: 15px;
        align-items: start;
      }
    }

    .section-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    }

    .section-content {
      padding: 1rem;
    }

    button[mat-button] {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    button[mat-button] mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    .search-button,
    .add-button,
    .add-downtime-button {
      background-color: var(--md-sys-color-primary) !important;
      color: var(--md-sys-color-on-primary) !important;
      border-radius: 20px !important;
    }

    .search-button:hover:not([disabled]),
    .add-button:hover:not([disabled]),
    .add-downtime-button:hover:not([disabled]) {
      opacity: 0.9;
    }

    .search-button:active:not([disabled]),
    .add-button:active:not([disabled]),
    .add-downtime-button:active:not([disabled]) {
      opacity: 0.8;
    }

    @media (max-width: 1400px) {
      .sections-container {
        flex-direction: column;
      }

      .section-forklifts,
      .section-downtimes {
        flex: 1;
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-section-title {
        font-size: 1.5rem;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-input {
        max-width: 100%;
        width: 100%;
      }

      .filter-row button[mat-button] {
        width: 100%;
        justify-content: center;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .section-header button[mat-button] {
        width: 100%;
        justify-content: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftsPageComponent {
  readonly store = inject(ForkliftsStore);

  searchNumber = '';

  ngOnInit(): void {
    this.store.loadForklifts();
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

  selectedForkliftNumber(): string {
    const selectedId = this.store.selectedForkliftId();
    if (!selectedId) {
      return '';
    }
    const selected = this.store.forklifts().find((f) => f.id === selectedId);
    return selected ? selected.number : '';
  }
}