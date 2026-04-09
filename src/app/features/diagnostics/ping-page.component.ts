import { Component, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { PingStore, PingResult } from './ping.store';

@Component({
  selector: 'app-ping-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTableModule,
    FormsModule,
  ],
  host: {
    class: 'ping-page',
  },
  template: `
    <div class="page-content">
      <!-- Заголовок страницы -->
      <div class="header-section">
        <h2 class="page-section-title">Ping - Диагностика</h2>
        <div class="status-indicator" [class.running]="store.isRunning()" [class.stopped]="!store.isRunning()">
          <mat-icon>{{ store.isRunning() ? 'play_circle' : 'stop_circle' }}</mat-icon>
          <span class="status-text">{{ store.isRunning() ? 'Запущен' : 'Остановлен' }}</span>
        </div>
      </div>

      <!-- Панель управления -->
      <mat-card class="control-panel" appearance="outlined">
        <mat-card-content class="control-content">
          <div class="control-row">
            <button
              mat-button
              class="start-button"
              (click)="store.startPing()"
              [disabled]="store.isRunning()"
              [attr.aria-label]="'Запустить пинг'"
            >
              <mat-icon>play_arrow</mat-icon>
              Start
            </button>
            <button
              mat-button
              class="stop-button"
              (click)="store.stopPing()"
              [disabled]="!store.isRunning()"
              [attr.aria-label]="'Остановить пинг'"
            >
              <mat-icon>stop</mat-icon>
              Stop
            </button>
            <button
              mat-button
              class="clear-button"
              (click)="store.clearResults()"
              [disabled]="store.pingResults().length === 0"
              [attr.aria-label]="'Очистить результаты'"
            >
              <mat-icon>delete_outline</mat-icon>
              Очистить
            </button>
          </div>
          <div class="info-text">
            <mat-icon>info_outline</mat-icon>
            <span>URL: {{ PING_URL }} | Интервал: 60 секунд</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Таблица результатов -->
      <mat-card class="results-panel" appearance="outlined" *ngIf="store.pingResults().length > 0 || store.isRunning()">
        <mat-card-header>
          <mat-card-title class="results-title">
            <mat-icon>history</mat-icon>
            Результаты пинга (последние 20)
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="results-content">
          @if (store.pingResults().length === 0 && store.isRunning()) {
            <div class="loading-container">
              <mat-progress-spinner mode="indeterminate" diameter="40" />
              <span>Выполняется первый запрос...</span>
            </div>
          } @else {
            <table mat-table [dataSource]="store.pingResults()" class="ping-table">
              <!-- Время -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef class="column-timestamp">
                  <div class="header-text">Время</div>
                </th>
                <td mat-cell *matCellDef="let result" class="column-timestamp">
                  {{ formatTimestamp(result.timestamp) }}
                </td>
              </ng-container>

              <!-- Статус -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="column-status">
                  <div class="header-text">Статус</div>
                </th>
                <td mat-cell *matCellDef="let result" class="column-status">
                  <div class="status-badge" [class.success]="result.status === 'success'" [class.error]="result.status === 'error'">
                    <mat-icon>{{ result.status === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                    <span>{{ result.status === 'success' ? 'Успешно' : 'Ошибка' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Время отклика -->
              <ng-container matColumnDef="responseTime">
                <th mat-header-cell *matHeaderCellDef class="column-response-time">
                  <div class="header-text">Время отклика</div>
                </th>
                <td mat-cell *matCellDef="let result" class="column-response-time">
                  @if (result.responseTime !== undefined) {
                    <span>{{ result.responseTime.toFixed(0) }} мс</span>
                  } @else {
                    <span class="unknown">-</span>
                  }
                </td>
              </ng-container>

              <!-- Ошибка -->
              <ng-container matColumnDef="error">
                <th mat-header-cell *matHeaderCellDef class="column-error">
                  <div class="header-text">Ошибка</div>
                </th>
                <td mat-cell *matCellDef="let result" class="column-error">
                  @if (result.error) {
                    <span class="error-message">{{ result.error }}</span>
                  } @else {
                    <span class="no-error">-</span>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>

      <!-- Пустое состояние -->
      <mat-card class="empty-state" appearance="outlined" *ngIf="store.pingResults().length === 0 && !store.isRunning()">
        <mat-card-content class="empty-content">
          <mat-icon class="empty-icon">network_check</mat-icon>
          <h3 class="empty-title">Нет данных</h3>
          <p class="empty-description">
            Нажмите кнопку <strong>Start</strong> для начала мониторинга
          </p>
        </mat-card-content>
      </mat-card>
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
      gap: 1rem;
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: 20px;
      padding: 1.5rem;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .page-section-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      transition: all 0.3s ease;

      &.running {
        background-color: var(--md-sys-color-success-container);
        color: var(--md-sys-color-on-success-container);
      }

      &.stopped {
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
      }

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .control-panel {
      background-color: var(--md-sys-color-surface-container);
    }

    .control-content {
      padding: 1rem;
    }

    .control-row {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    button[mat-button] {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.5rem;
      font-size: 0.9rem;
      border-radius: 20px;
    }

    .start-button {
      background-color: var(--md-sys-color-success) !important;
      color: var(--md-sys-color-on-success) !important;
    }

    .stop-button {
      background-color: var(--md-sys-color-error) !important;
      color: var(--md-sys-color-on-error) !important;
    }

    .clear-button {
      background-color: var(--md-sys-color-secondary) !important;
      color: var(--md-sys-color-on-secondary) !important;
    }

    button[mat-button]:hover:not([disabled]) {
      opacity: 0.9;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.875rem;

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .results-panel,
    .empty-state {
      background-color: var(--md-sys-color-surface-container);
    }

    .results-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .results-content {
      padding: 1rem;
    }

    .ping-table {
      width: 100%;
      table-layout: fixed;
    }

    .ping-table th,
    .ping-table td {
      padding: 0.75rem 0.5rem;
      text-align: left;
    }

    .ping-table th .header-text {
      display: block;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    }

    .column-timestamp {
      width: 180px;
    }

    .column-status {
      width: 150px;
    }

    .column-response-time {
      width: 150px;
    }

    .column-error {
      width: calc(100% - 480px);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;

      &.success {
        background-color: var(--md-sys-color-success-container);
        color: var(--md-sys-color-on-success-container);

        mat-icon {
          color: var(--md-sys-color-success);
        }
      }

      &.error {
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);

        mat-icon {
          color: var(--md-sys-color-error);
        }
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .error-message {
      color: var(--md-sys-color-error);
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      max-width: 100%;
    }

    .no-error,
    .unknown {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.875rem;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      justify-content: center;

      span {
        color: var(--md-sys-color-on-surface-variant);
      }
    }

    .empty-content {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--md-sys-color-primary);
      opacity: 0.5;
    }

    .empty-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    }

    .empty-description {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .page-content {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-section-title {
        font-size: 1.5rem;
      }

      .control-row {
        flex-direction: column;
        align-items: stretch;
      }

      button[mat-button] {
        width: 100%;
        justify-content: center;
      }

      .ping-table {
        font-size: 0.875rem;
      }

      .column-timestamp {
        width: 140px;
      }

      .column-status {
        width: 120px;
      }

      .column-response-time {
        width: 120px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PingPageComponent implements OnDestroy {
  readonly store = inject(PingStore);
  readonly PING_URL = this.store.PING_URL;
  readonly displayedColumns: (keyof PingResult)[] = ['timestamp', 'status', 'responseTime', 'error'];

  ngOnDestroy(): void {
    // Store автоматически очистит ресурсы при уничтожении
  }

  formatTimestamp(date: Date): string {
    // Используем нативное форматирование даты без DatePipe
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
}