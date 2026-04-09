import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ForkliftTableComponent } from './components/forklift-table.component';
import { DowntimePanelComponent } from './components/downtime-panel.component';
import { TestTaskStore } from './test-task.store';

@Component({
  selector: 'app-test-task-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ForkliftTableComponent,
    DowntimePanelComponent
  ],
  host: {
    class: 'test-task-page',
  },
  template: `
    <div class="page-content">
      <h2 class="page-section-title">Test Task — Справочник погрузчиков</h2>

      <section class="filters-panel" aria-label="Поиск погрузчиков">
        <div class="filter-row">
          <label for="search-number" class="filter-label">Номер погрузчика:</label>
          <input
            id="search-number"
            matInput
            class="filter-input"
            placeholder="Введите номер для поиска"
            [(ngModel)]="searchNumber"
            (keyup.enter)="applySearch()"
            [attr.aria-label]="'Поиск по номеру погрузчика'"
          />
          <button
            mat-button
            class="action-button primary"
            (click)="applySearch()"
            [attr.aria-label]="'Искать погрузчики'"
          >
            <mat-icon>search</mat-icon>
            Искать
          </button>
          <button
            mat-button
            (click)="resetFilter()"
            [attr.aria-label]="'Сбросить фильтр'"
          >
            <mat-icon>clear</mat-icon>
            Сбросить фильтр
          </button>
        </div>
      </section>

      <div class="actions-bar">
        <div class="actions-left">
          <button
            mat-button
            class="action-button primary"
            (click)="addForklift()"
            [disabled]="store.isEditing()"
            [attr.aria-label]="'Добавить новый погрузчик'"
          >
            <mat-icon>add</mat-icon>
            Добавить
          </button>
          <button
            mat-button
            class="action-button primary"
            (click)="save()"
            [disabled]="!store.isEditing()"
            [attr.aria-label]="'Сохранить изменения'"
          >
            <mat-icon>save</mat-icon>
            Сохранить
          </button>
          <button
            mat-button
            (click)="cancel()"
            [disabled]="!store.isEditing()"
            [attr.aria-label]="'Отменить изменения'"
          >
            <mat-icon>undo</mat-icon>
            Отмена
          </button>
        </div>
      </div>

      <div class="sections-container">
        <section class="section-forklifts" aria-label="Погрузчики">
          <app-forklift-table></app-forklift-table>
        </section>

        <section class="section-downtimes" aria-label="Простои">
          <div class="section-header">
            <h3 class="section-title">
              <strong>Простои по погрузчику</strong> {{ selectedForkliftNumber() }}
            </h3>
          </div>
          <div class="section-content">
            <app-downtime-panel></app-downtime-panel>
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

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions-left {
      display: flex;
      gap: 0.5rem;
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

    .action-button.primary {
      background-color: var(--md-sys-color-primary) !important;
      color: var(--md-sys-color-on-primary) !important;
      border-radius: 20px !important;
    }

    .action-button.primary:hover:not([disabled]) {
      opacity: 0.9;
    }

    .action-button.primary:active:not([disabled]) {
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

      .filter-row button[mat-button],
      .actions-left button[mat-button] {
        width: 100%;
        justify-content: center;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTaskPageComponent {
  readonly store = inject(TestTaskStore);

  searchNumber = '';

  ngOnInit(): void {
    this.store['loadForklifts']();
  }

  applySearch(): void {
    this.store['searchByNumber'](this.searchNumber.trim());
  }

  resetFilter(): void {
    this.searchNumber = '';
    this.store['resetFilter']();
  }

  addForklift(): void {
    this.store['startAdding']();
  }

  save(): void {
    this.store['save']().subscribe();
  }

  cancel(): void {
    this.store['cancel']().subscribe();
  }

  selectedForkliftNumber(): string {
    const selectedId = this.store.selectedForkliftId();
    if (!selectedId) {
      return '';
    }
    const selected = this.store.forklifts().find((f) => f.id === selectedId);
    return selected ? `№ ${selected.number}` : '';
  }
}
