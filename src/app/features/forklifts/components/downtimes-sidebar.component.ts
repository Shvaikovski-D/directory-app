import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ForkliftsStore } from '../forklifts.store';
import type { ForkliftItemDto } from '../../../core/models/forklifts.models';

@Component({
  selector: 'app-downtimes-sidebar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
  ],
  host: {
    class: 'downtimes-sidebar',
  },
  template: `
    <mat-card class="sidebar-card">
      <mat-card-header>
        <mat-card-title class="sidebar-title">
          {{ sidebarTitle() }}
        </mat-card-title>
        <button
          mat-button
          color="primary"
          (click)="addDowntime()"
          [disabled]="!selectedForklift()"
          [attr.aria-label]="'Добавить простой для погрузчика ' + selectedForklift()?.number"
        >
          <mat-icon>add</mat-icon>
          Добавить
        </button>
      </mat-card-header>
      <mat-card-content class="sidebar-content">
        @if (selectedForklift()) {
          <table mat-table class="downtimes-table">
            <!-- Код -->
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef class="column-code">
                Код
              </th>
              <td mat-cell *matCellDef class="column-code">
                -
              </td>
            </ng-container>

            <!-- Начало -->
            <ng-container matColumnDef="start">
              <th mat-header-cell *matHeaderCellDef class="column-start">
                Начало
              </th>
              <td mat-cell *matCellDef class="column-start">
                -
              </td>
            </ng-container>

            <!-- Окончание -->
            <ng-container matColumnDef="end">
              <th mat-header-cell *matHeaderCellDef class="column-end">
                Окончание
              </th>
              <td mat-cell *matCellDef class="column-end">
                -
              </td>
            </ng-container>

            <!-- Время простоя -->
            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef class="column-duration">
                Время простоя
              </th>
              <td mat-cell *matCellDef class="column-duration">
                -
              </td>
            </ng-container>

            <!-- Причина -->
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef class="column-reason">
                Причина
              </th>
              <td mat-cell *matCellDef class="column-reason">
                -
              </td>
            </ng-container>

            <!-- Действия -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="column-actions">
                Действия
              </th>
              <td mat-cell *matCellDef class="column-actions">
                <button
                  mat-button
                  [disabled]="true"
                  [attr.aria-label]="'Редактировать простой'"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-button
                  color="warn"
                  [disabled]="true"
                  [attr.aria-label]="'Удалить простой'"
                >
                  <mat-icon>delete</mat-icon>
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

    .sidebar-card ::ng-deep .mat-mdc-card-header {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 1rem;
    }

    .sidebar-title {
      font-size: 1.1rem;
      font-weight: 500;
      color: #1976d2;
    }

    .sidebar-content {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .downtimes-table {
      width: 100%;
      border-collapse: collapse;
    }

    .header-row {
      background-color: #f5f5f5;
      font-weight: 500;
    }

    .data-row {
      height: 50px;
    }

    .column-code {
      width: 80px;
    }

    .column-start {
      width: 120px;
    }

    .column-end {
      width: 120px;
    }

    .column-duration {
      width: 100px;
    }

    .column-reason {
      flex: 1;
    }

    .column-actions {
      width: 120px;
    }

    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      text-align: center;
      padding: 2rem;
    }

    .no-selection-icon {
      font-size: 3rem;
      color: #bdbdbd;
      margin-bottom: 1rem;
    }

    .no-selection p {
      margin: 0;
      font-size: 0.95rem;
    }

    button[mat-button] {
      min-width: auto;
      padding: 0.5rem 1rem;
      margin-right: 0.25rem;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    button[mat-button] mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimesSidebarComponent {
  readonly store = inject(ForkliftsStore);
  readonly forklifts = computed(() => this.store.forklifts());

  readonly selectedForklift = computed(() => {
    const selectedId = this.store.selectedForkliftId();
    if (selectedId === null) {
      return null;
    }
    return this.forklifts().find((f) => f.id === selectedId) || null;
  });

  readonly sidebarTitle = computed(() => {
    const forklift = this.selectedForklift();
    return forklift ? `Простой по погрузчику ${forklift.number}` : 'Простой по погрузчику';
  });

  readonly displayedColumns: string[] = [
    'code',
    'start',
    'end',
    'duration',
    'reason',
    'actions',
  ];

  addDowntime(): void {
    // Placeholder - функционал будет реализован позже
    console.log('Добавить простой для погрузчика:', this.selectedForklift()?.number);
  }
}