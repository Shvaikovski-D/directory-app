import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TestTaskStore } from '../test-task.store';
import type { ForkliftItemDto } from '../../../core/models/forklifts.models';

@Component({
  selector: 'app-forklift-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  host: {
    class: 'forklift-table-container',
  },
  template: `
    <div class="table-container">
      @if (store.loading()) {
        <div class="loading-overlay">Загрузка данных...</div>
      }

      @if (store.error()) {
        <div class="error-message" role="alert">
          {{ store.error() }}
          <button mat-button (click)="store.clearError()">✕</button>
        </div>
      }

      <table mat-table [dataSource]="forkliftsList()" class="forklifts-table">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="column-id">
            <span class="header-text">Код записи</span>
          </th>
          <td mat-cell *matCellDef="let element" class="column-id">
            {{ element.id }}
          </td>
        </ng-container>

        <ng-container matColumnDef="brand">
          <th mat-header-cell *matHeaderCellDef class="column-brand">
            Марка <span class="required">*</span>
          </th>
          <td mat-cell *matCellDef="let element" class="column-brand">
            @if (isEditing(element.id)) {
              @if (getBrandControl(element.id)) {
                <input
                  type="text"
                  [formControl]="getBrandControl(element.id)!"
                  class="simple-input"
                  placeholder="Марка"
                  [attr.aria-label]="'Марка погрузчика ' + element.id"
                />
              }
            } @else {
              {{ element.brand }}
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="number">
          <th mat-header-cell *matHeaderCellDef class="column-number">
            Номер <span class="required">*</span>
          </th>
          <td mat-cell *matCellDef="let element" class="column-number">
            @if (isEditing(element.id)) {
              @if (getNumberControl(element.id)) {
                <input
                  type="text"
                  [formControl]="getNumberControl(element.id)!"
                  class="simple-input"
                  placeholder="Номер"
                  [attr.aria-label]="'Номер погрузчика ' + element.id"
                />
              }
            } @else {
              {{ element.number }}
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="loadCapacity">
          <th mat-header-cell *matHeaderCellDef class="column-loadCapacity">
            <span class="header-text">Грузоподъемность (т) <span class="required">*</span></span>
          </th>
          <td mat-cell *matCellDef="let element" class="column-loadCapacity">
            @if (isEditing(element.id)) {
              @if (getLoadCapacityControl(element.id)) {
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  [formControl]="getLoadCapacityControl(element.id)!"
                  class="simple-input"
                  placeholder="Грузоподъемность"
                  [attr.aria-label]="'Грузоподъемность погрузчика ' + element.id"
                />
              }
            } @else {
              {{ element.loadCapacity }}
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="isActive">
          <th mat-header-cell *matHeaderCellDef class="column-isActive">
            Активен
          </th>
          <td mat-cell *matCellDef="let element" class="column-isActive">
            @if (isEditing(element.id)) {
              @if (getIsActiveControl(element.id)) {
                <mat-checkbox
                  [formControl]="getIsActiveControl(element.id)!"
                  [attr.aria-label]="'Активность погрузчика ' + element.id">
                </mat-checkbox>
              }
            } @else {
              @if (element.isActive) {
                <mat-icon class="active-icon">check</mat-icon>
              } @else {
                <mat-icon class="inactive-icon">close</mat-icon>
              }
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="lastModified">
          <th mat-header-cell *matHeaderCellDef class="column-lastModified">
            <span class="header-text">Время и дата изменения</span>
          </th>
          <td mat-cell *matCellDef="let element" class="column-lastModified">
            {{ formatDate(element.lastModified) }}
          </td>
        </ng-container>

        <ng-container matColumnDef="lastModifiedBy">
          <th mat-header-cell *matHeaderCellDef class="column-lastModifiedBy">
            Пользователь
          </th>
          <td mat-cell *matCellDef="let element" class="column-lastModifiedBy">
            {{ element.lastModifiedBy || '-' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="column-actions">
            Действия
          </th>
          <td mat-cell *matCellDef="let element" class="column-actions">
            @if (isEditing(element.id)) {
              <button
                mat-button
                (click)="saveRow()"
                [disabled]="!isFormValid(element.id)"
                [attr.aria-label]="'Сохранить погрузчик ' + element.id"
                matTooltip="Сохранить"
              >
                <mat-icon style="color: grey; font-weight: bolder;">check</mat-icon>
              </button>
              <button
                mat-button
                (click)="cancelEdit()"
                [attr.aria-label]="'Отменить редактирование погрузчика ' + element.id"
                matTooltip="Отменить"
              >
                <mat-icon style="color: grey; font-weight: bolder;">close</mat-icon>
              </button>
            } @else {
              <button
                mat-button
                (click)="editRow(element.id)"
                [disabled]="store.isEditing()"
                [attr.aria-label]="'Изменить погрузчик ' + element.id"
                matTooltip="Изменить"
              >
                <mat-icon style="color: grey; font-weight: bolder;">edit</mat-icon>
              </button>
              <button
                mat-button
                color="warn"
                (click)="deleteRow(element.id)"
                [disabled]="store.isEditing()"
                [attr.aria-label]="'Удалить погрузчик ' + element.id"
                matTooltip="Удалить"
              >
                <mat-icon style="color: grey; font-weight: bolder;">clear</mat-icon>
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
          [class.selected]="isSelected(row.id)"
          [class.editing]="isEditing(row.id)"
          (click)="selectForklift(row.id)"
          class="data-row"
          role="button"
          tabindex="0"
          (keydown.enter)="selectForklift(row.id)"
          [attr.aria-label]="'Погрузчик ' + row.number + ', марка ' + row.brand + ', кликните для выбора'"
        ></tr>
      </table>

      @if (forkliftsList().length === 0 && !store.loading()) {
        <div class="no-data">
          Нет данных для отображения
        </div>
      }

      @if (editingErrors().length > 0) {
        <div class="editing-errors" role="alert">
          @for (error of editingErrors(); track error) {
            <div class="error-item">{{ error }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .table-container {
      position: relative;
      background: var(--md-sys-color-surface);
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: var(--md-sys-color-on-surface-variant);
      z-index: 10;
    }

    .error-message {
      padding: 1rem;
      background-color: var(--md-sys-color-error-container);
      border-left: 4px solid var(--md-sys-color-error);
      color: var(--md-sys-color-on-error-container);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .error-message button {
      margin-left: 1rem;
    }

    .forklifts-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;

      th {
        font-weight: 600;
      }
    }

    .forklifts-table td, .forklifts-table th {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.75rem;
      text-align: center;
    }

    .forklifts-table th .header-text {
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
      cursor: pointer;
      transition: background-color 0.2s ease;
      height: 60px;
      max-height: 60px;
      overflow: hidden;
    }

    .simple-input {
      width: 100%;
      height: 2rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: 4px;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    .simple-input:focus {
      outline: 2px solid var(--md-sys-color-primary);
      border-color: transparent;
    }

    .simple-input.ng-invalid {
      border-color: var(--md-sys-color-error);
    }

    .simple-input.ng-invalid:focus {
      outline-color: var(--md-sys-color-error);
    }

    .simple-input::placeholder {
      color: var(--md-sys-color-on-surface-variant);
    }

    .data-row:hover {
      background-color: var(--md-sys-color-surface-container-high);
    }

    .data-row.selected {
      background-color: var(--md-sys-color-secondary-container);
    }

    .data-row.selected:hover {
      background-color: var(--md-sys-color-secondary-container-high);
    }

    .data-row.editing {
      background-color: var(--md-sys-color-tertiary-container);
    }

    .column-id {
      width: 88px;
    }

    .column-brand {
      width: calc((100% - (80px + 130px + 86px + 140px + 112px)) * 0.25);
    }

    .column-number {
      width: calc((100% - (80px + 130px + 86px + 140px + 112px)) * 0.25);
    }

    .column-loadCapacity {
      width: 130px;
    }

    .column-isActive {
      width: 86px;
      text-align: center;
    }

    .column-lastModified {
      width: 140px;
    }

    .column-lastModifiedBy {
      width: calc((100% - (80px + 130px + 86px + 140px + 112px)) * 0.5);
    }

    .column-actions {
      width: 112px;
    }

    .editing-errors {
      margin-top: 1rem;
      padding: 1rem;
      background-color: var(--md-sys-color-error-container);
      border-left: 4px solid var(--md-sys-color-error);
      color: var(--md-sys-color-on-error-container);
      border-radius: 4px;
    }

    .editing-errors .error-item {
      margin-bottom: 0.5rem;
    }

    .editing-errors .error-item:last-child {
      margin-bottom: 0;
    }

    .active-icon {
      color: var(--md-sys-color-primary);
    }

    .inactive-icon {
      color: var(--md-sys-color-error);
    }

    .required {
      color: var(--md-sys-color-error);
    }

    .no-data {
      padding: 2rem;
      text-align: center;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 1rem;
    }

    button[mat-button] {
      min-width: auto;
      padding: 0 0.5rem;
      margin-right: 0.25rem;
      font-size: 0.85rem;
    }

    button[mat-button] mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      margin-right: 0;
      vertical-align: middle;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftTableComponent {
  readonly store = inject(TestTaskStore);
  private readonly fb = inject(FormBuilder);

  readonly forkliftsList = computed(() => this.store.displayForklifts());
  readonly displayedColumns: string[] = [
    'id',
    'brand',
    'number',
    'loadCapacity',
    'isActive',
    'lastModified',
    'lastModifiedBy',
    'actions',
  ];

  private rowForms = new Map<number, FormGroup>();

  isEditing(id: number): boolean {
    return this.store.editingForkliftId() === id;
  }

  isSelected(id: number): boolean {
    return this.store.selectedForkliftId() === id;
  }

  editRow(id: number): void {
    this.store.startEditing(id);
  }

  cancelEdit(): void {
    this.store.cancel().subscribe();
  }

  saveRow(): void {
    const editingId = this.store.editingForkliftId();
    if (editingId === null) {
      return;
    }

    const form = this.rowForms.get(editingId);
    if (form && form.valid) {
      const formValue = form.value;

      this.store.updateEditingField('brand', formValue.brand);
      this.store.updateEditingField('number', formValue.number);
      this.store.updateEditingField('loadCapacity', Number(formValue.loadCapacity));
      this.store.updateEditingField('isActive', formValue.isActive);

      this.store.save().subscribe();
      this.rowForms.delete(editingId);
    }
  }

  deleteRow(id: number): void {
    this.store.delete(id).subscribe();
    this.rowForms.delete(id);
  }

  selectForklift(id: number): void {
    this.store.selectForklift(id);
  }

  getBrandControl(id: number): FormControl | null {
    return this.getOrCreateForm(id).get('brand') as FormControl | null;
  }

  getNumberControl(id: number): FormControl | null {
    return this.getOrCreateForm(id).get('number') as FormControl | null;
  }

  getLoadCapacityControl(id: number): FormControl | null {
    return this.getOrCreateForm(id).get('loadCapacity') as FormControl | null;
  }

  getIsActiveControl(id: number): FormControl | null {
    return this.getOrCreateForm(id).get('isActive') as FormControl | null;
  }

  isFormValid(id: number): boolean {
    const form = this.rowForms.get(id);
    return form ? form.valid : false;
  }

  private getOrCreateForm(id: number): FormGroup {
    const forkliftsList = this.forkliftsList();
    const element = forkliftsList.find((f) => f.id === id);

    if (!element) {
      return this.fb.group({});
    }

    let form = this.rowForms.get(id);

    if (!form) {
      const editingForklift = this.store.editingForklift();
      const isNewRecord = this.store.editingForkliftId() === -1;

      form = this.fb.group({
        brand: [
          editingForklift.brand || (isNewRecord ? '' : element.brand),
          [Validators.required],
        ],
        number: [
          editingForklift.number || (isNewRecord ? '' : element.number),
          [Validators.required],
        ],
        loadCapacity: [
          editingForklift.loadCapacity ?? (isNewRecord ? 0 : element.loadCapacity),
          [Validators.required, Validators.min(0)],
        ],
        isActive: [
          editingForklift.isActive ?? (isNewRecord ? true : element.isActive),
        ],
      });

      this.rowForms.set(id, form);
    }

    return form;
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  }

  readonly editingErrors = computed(() => {
    const errors: string[] = [];
    const editingId = this.store.editingForkliftId();

    if (editingId === null) return errors;

    const form = this.rowForms.get(editingId);
    if (!form) return errors;

    if (form.get('brand')?.hasError('required')) {
      errors.push('Марка: обязательное поле');
    }
    if (form.get('number')?.hasError('required')) {
      errors.push('Номер: обязательное поле');
    }
    if (form.get('loadCapacity')?.hasError('required')) {
      errors.push('Грузоподъемность: обязательное поле');
    }
    if (form.get('loadCapacity')?.hasError('min')) {
      errors.push('Грузоподъемность: значение должно быть положительным');
    }

    return errors;
  });
}
