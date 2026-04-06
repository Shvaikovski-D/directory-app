import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ForkliftsStore } from '../forklifts.store';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { calculateDowntimeDuration } from '../../../utils/downtime.utils';
import type { DowntimeItemDto } from '../../../core/models/downtimes.models';

@Component({
  selector: 'app-downtimes-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormatDatePipe,
  ],
  host: {
    class: 'downtimes-sidebar',
  },
  template: `
    <mat-card class="sidebar-card">
      <mat-card-content class="sidebar-content">
        @if (selectedForklift()) {
          @if (downtimesLoading()) {
            <div class="loading-container">
              <mat-progress-spinner diameter="40" mode="indeterminate" />
              <p>Загрузка простоев...</p>
            </div>
          } @else if (downtimes().length === 0) {
            <div class="no-downtimes">
              <mat-icon class="no-downtimes-icon">info</mat-icon>
              <p>Нет зарегистрированных простоев для этого погрузчика</p>
            </div>
          } @else {
            <!-- таблица простоев -->
            <table mat-table class="downtimes-table" [dataSource]="downtimes()">
              <!-- Код -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef class="column-code">
                  Код
                </th>
                <td mat-cell *matCellDef="let element" class="column-code">
                  {{ element.id }}
                </td>
              </ng-container>

              <!-- Начало -->
              <ng-container matColumnDef="start">
                <th mat-header-cell *matHeaderCellDef class="column-start">
                  Начало
                </th>
                <td mat-cell *matCellDef="let element" class="column-start">
                  {{ element.startedAt | formatDate }}
                </td>
              </ng-container>

              <!-- Окончание -->
              <ng-container matColumnDef="end">
                <th mat-header-cell *matHeaderCellDef class="column-end">
                  Окончание
                </th>
                <td mat-cell *matCellDef="let element" class="column-end">
                  {{ element.endedAt | formatDate }}
                </td>
              </ng-container>

              <!-- Время простоя -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef class="column-duration">
                  <span class="header-text">Время простоя</span>
                </th>
                <td mat-cell *matCellDef="let element" class="column-duration">
                  {{ calculateDowntimeDuration(element.startedAt, element.endedAt) }}
                </td>
              </ng-container>

              <!-- Причина -->
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef class="column-reason">
                  Причина
                </th>
                <td mat-cell *matCellDef="let element" class="column-reason">
                  {{ element.description }}
                </td>
              </ng-container>

              <!-- Действия -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="column-actions">
                  Действия
                </th>
                <td mat-cell *matCellDef="let element" class="column-actions">
                  <button
                    mat-button
                    [disabled]="true"
                    [attr.aria-label]="'Редактировать простой ' + element.id"
                    matTooltip="Редактировать"
                  >
                    <mat-icon style="color: grey; font-weight: bolder;">edit</mat-icon>
                  </button>
                  <button
                    mat-button
                    color="warn"
                    [disabled]="true"
                    [attr.aria-label]="'Удалить простой ' + element.id"
                    matTooltip="Удалить"
                  >
                    <mat-icon style="color: grey; font-weight: bolder;">clear</mat-icon>
                  </button>
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
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .sidebar-content {
      flex: 1;
      overflow: auto;
      padding: 0;
      min-height: 200px;
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

    /* контейнер заголовка — разрешаем перенос слов только для заголовков */
    .downtimes-table th .header-text {
      display: block;
      white-space: normal;          /* разрешаем перенос заголовков */
      overflow-wrap: anywhere;      /* перенос длинных слов при необходимости */
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

    .column-code {
      width: 60px;
    }

    .column-start {
      width: 130px;
    }

    .column-end {
      width: 130px;
    }

    .column-duration {
      width: 110px;
    }

    .column-reason {
      flex: 1;
    }

    .column-actions {
      width: 112px;
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
export class DowntimesSidebarComponent {
  readonly store = inject(ForkliftsStore);

  readonly forklifts = computed(() => this.store.forklifts());
  readonly downtimes = computed(() => this.store.downtimes());
  readonly downtimesLoading = computed(() => this.store.downtimesLoading());

  readonly selectedForklift = computed(() => {
    const selectedId = this.store.selectedForkliftId();
    if (selectedId === null) {
      return null;
    }
    return this.forklifts().find((f) => f.id === selectedId) || null;
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
}