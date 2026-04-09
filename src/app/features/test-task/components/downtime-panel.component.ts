import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestTaskStore } from '../test-task.store';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { calculateDowntimeDuration } from '../../../utils/downtime.utils';

@Component({
  selector: 'app-downtime-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormatDatePipe,
  ],
  host: {
    class: 'downtime-panel',
  },
  template: `
    <div class="panel-container">
      @if (selectedForklift()) {
        @if (downtimesLoading()) {
          <div class="loading-container">
            <mat-progress-spinner diameter="40" mode="indeterminate" />
            <p>Загрузка простоев...</p>
          </div>
        } @else if (downtimesError()) {
          <div class="error-message" role="alert">
            {{ downtimesError() }}
          </div>
        } @else if (downtimes().length === 0) {
          <div class="no-downtimes">
            <mat-icon class="no-downtimes-icon">info</mat-icon>
            <p>Нет зарегистрированных простоев для этого погрузчика</p>
          </div>
        } @else {
          <table mat-table class="downtimes-table" [dataSource]="downtimes()">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef class="column-code">Код</th>
              <td mat-cell *matCellDef="let element" class="column-code">{{ element.id }}</td>
            </ng-container>

            <ng-container matColumnDef="start">
              <th mat-header-cell *matHeaderCellDef class="column-start">
                <span class="header-text">Дата/время начала</span>
              </th>
              <td mat-cell *matCellDef="let element" class="column-start">
                {{ element.startedAt | formatDate }}
              </td>
            </ng-container>

            <ng-container matColumnDef="end">
              <th mat-header-cell *matHeaderCellDef class="column-end">
                <span class="header-text">Дата/время решения</span>
              </th>
              <td mat-cell *matCellDef="let element" class="column-end">
                @if (element.endedAt) {
                  {{ element.endedAt | formatDate }}
                } @else {
                  <span class="ongoing">В работе</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef class="column-duration">
                <span class="header-text">Время простоя</span>
              </th>
              <td mat-cell *matCellDef="let element" class="column-duration">
                {{ calculateDowntimeDuration(element.startedAt, element.endedAt) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef class="column-reason">Описание</th>
              <td mat-cell *matCellDef="let element" class="column-reason">
                {{ element.description || '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="column-actions">Действия</th>
              <td mat-cell *matCellDef="let element" class="column-actions">
                @if (!element.endedAt) {
                  <button
                    mat-button
                    (click)="resolveDowntime(element.id)"
                    [attr.aria-label]="'Решить простой ' + element.id"
                    matTooltip="Решить проблему"
                  >
                    <mat-icon style="color: grey; font-weight: bolder;">check_circle</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="displayedColumns"
              class="header-row"
            ></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              class="data-row"
            ></tr>
          </table>
        }
      } @else {
        <div class="no-selection">
          <mat-icon class="no-selection-icon">info</mat-icon>
          <p>Выберите погрузчик для просмотра простоев</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .panel-container {
      flex: 1;
      overflow: auto;
      min-height: 200px;
      background: var(--md-sys-color-surface);
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .downtimes-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;

      th {
        font-weight: 600;
      }
    }

    .downtimes-table td, .downtimes-table th {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.75rem;
      text-align: center;
    }

    .downtimes-table th .header-text {
      display: block;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      hyphens: auto;
      line-height: 1.1;
      padding: 0.25rem 0.5rem;
      box-sizing: border-box;
      text-align: center;
    }

    .header-row {
      background-color: var(--md-sys-color-surface-container-high);
      font-weight: 500;
      font-size: 0.75rem;
    }

    .data-row {
      height: 50px;
      font-size: 0.75rem;
    }

    .column-code { width: 60px; }
    .column-start { width: 140px; }
    .column-end { width: 140px; }
    .column-duration { width: 100px; }
    .column-reason { flex: 1; }
    .column-actions { width: 100px; }

    .ongoing {
      color: var(--md-sys-color-error);
      font-weight: 500;
    }

    .error-message {
      padding: 1rem;
      background-color: var(--md-sys-color-error-container);
      border-left: 4px solid var(--md-sys-color-error);
      color: var(--md-sys-color-on-error-container);
    }

    .no-selection,
    .no-downtimes,
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--md-sys-color-on-surface-variant);
      text-align: center;
      padding: 2rem;
    }

    .no-selection-icon,
    .no-downtimes-icon {
      font-size: 3rem;
      color: var(--md-sys-color-outline);
      margin-bottom: 1rem;
    }

    .no-selection p,
    .no-downtimes p,
    .loading-container p {
      margin: 0;
      font-size: 0.95rem;
    }

    button[mat-button] {
      min-width: auto;
      padding: 0 0.5rem;
      margin-right: 0.25rem;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    button[mat-button] mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      margin-right: 0;
      vertical-align: middle;
    }

    mat-progress-spinner {
      --mat-mdc-circular-progress-color: var(--md-sys-color-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimePanelComponent {
  readonly store = inject(TestTaskStore);

  readonly downtimes = computed(() => this.store.downtimes());
  readonly downtimesLoading = computed(() => this.store.downtimesLoading());
  readonly downtimesError = computed(() => this.store.downtimesError());

  readonly selectedForklift = computed(() => {
    const selectedId = this.store.selectedForkliftId();
    if (selectedId === null) {
      return null;
    }
    return this.store.forklifts().find((f) => f.id === selectedId) || null;
  });

  readonly displayedColumns: string[] = [
    'code',
    'start',
    'end',
    'duration',
    'reason',
    'actions',
  ];

  readonly calculateDowntimeDuration = calculateDowntimeDuration;

  resolveDowntime(id: number): void {
    this.store.resolveDowntime(id);
  }
}
