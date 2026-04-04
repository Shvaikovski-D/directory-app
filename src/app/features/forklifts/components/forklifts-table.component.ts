import { Component, inject, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ForkliftsStore } from '../forklifts.store';
import type { ForkliftItemDto } from '../../../core/models/forklifts.models';

@Component({
  selector: 'app-forklifts-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  host: {
    class: 'forklifts-table-container',
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
        <!-- Код записи -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="column-id">
            Код записи
          </th>
          <td mat-cell *matCellDef="let element" class="column-id">
            {{ element.id }}
          </td>
        </ng-container>

        <!-- Марка -->
        <ng-container matColumnDef="brand">
          <th mat-header-cell *matHeaderCellDef class="column-brand">
            Марка <span class="required">*</span>
          </th>
          <td mat-cell *matCellDef="let element; let i = index" class="column-brand">
            @if (isEditing(element.id)) {
              @if (getBrandControl(i)) {
                <mat-form-field appearance="outline" class="edit-field">
                  <input
                    matInput
                    [formControl]="getBrandControl(i)!"
                    placeholder="Марка"
                    required
                    [attr.aria-label]="'Марка погрузчика ' + element.id"
                  />
                  @if (getBrandControl(i)!.hasError('required')) {
                    <mat-error>Обязательное поле</mat-error>
                  }
                </mat-form-field>
              }
            } @else {
              {{ element.brand }}
            }
          </td>
        </ng-container>

        <!-- Номер -->
        <ng-container matColumnDef="number">
          <th mat-header-cell *matHeaderCellDef class="column-number">
            Номер <span class="required">*</span>
          </th>
          <td mat-cell *matCellDef="let element; let i = index" class="column-number">
            @if (isEditing(element.id)) {
              @if (getNumberControl(i)) {
                <mat-form-field appearance="outline" class="edit-field">
                  <input
                    matInput
                    [formControl]="getNumberControl(i)!"
                    placeholder="Номер"
                    required
                    [attr.aria-label]="'Номер погрузчика ' + element.id"
                  />
                  @if (getNumberControl(i)!.hasError('required')) {
                    <mat-error>Обязательное поле</mat-error>
                  }
                </mat-form-field>
              }
            } @else {
              {{ element.number }}
            }
          </td>
        </ng-container>

        <!-- Грузоподъемность -->
        <ng-container matColumnDef="loadCapacity">
          <th mat-header-cell *matHeaderCellDef class="column-loadCapacity">
            Грузоподъемность (т) <span class="required">*</span>
          </th>
          <td mat-cell *matCellDef="let element; let i = index" class="column-loadCapacity">
            @if (isEditing(element.id)) {
              @if (getLoadCapacityControl(i)) {
                <mat-form-field appearance="outline" class="edit-field">
                  <input
                    matInput
                    type="number"
                    min="0"
                    step="0.1"
                    [formControl]="getLoadCapacityControl(i)!"
                    placeholder="Грузоподъемность"
                    required
                    [attr.aria-label]="'Грузоподъемность погрузчика ' + element.id"
                  />
                  @if (getLoadCapacityControl(i)!.hasError('required')) {
                    <mat-error>Обязательное поле</mat-error>
                  }
                  @if (getLoadCapacityControl(i)!.hasError('min')) {
                    <mat-error>Значение должно быть положительным</mat-error>
                  }
                </mat-form-field>
              }
            } @else {
              {{ element.loadCapacity }}
            }
          </td>
        </ng-container>

        <!-- Активен -->
        <ng-container matColumnDef="isActive">
          <th mat-header-cell *matHeaderCellDef class="column-isActive">
            Активен
          </th>
          <td mat-cell *matCellDef="let element; let i = index" class="column-isActive">
            @if (isEditing(element.id)) {
              @if (getIsActiveControl(i)) {
                <mat-checkbox
                  [formControl]="getIsActiveControl(i)!"
                  [attr.aria-label]="'Активность погрузчика ' + element.id"
                >
                  Активен
                </mat-checkbox>
              }
            } @else {
              @if (element.isActive) {
                <mat-icon class="active-icon">check_circle</mat-icon>
              } @else {
                <mat-icon class="inactive-icon">cancel</mat-icon>
              }
            }
          </td>
        </ng-container>

        <!-- Время и дата -->
        <ng-container matColumnDef="lastModified">
          <th mat-header-cell *matHeaderCellDef class="column-lastModified">
            Время и дата
          </th>
          <td mat-cell *matCellDef="let element" class="column-lastModified">
            {{ formatDate(element.lastModified) }}
          </td>
        </ng-container>

        <!-- Пользователь -->
        <ng-container matColumnDef="lastModifiedBy">
          <th mat-header-cell *matHeaderCellDef class="column-lastModifiedBy">
            Пользователь
          </th>
          <td mat-cell *matCellDef="let element" class="column-lastModifiedBy">
            {{ element.lastModifiedBy || '-' }}
          </td>
        </ng-container>

        <!-- Действия -->
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
              >
                <mat-icon>save</mat-icon>
                Сохранить
              </button>
              <button
                mat-button
                (click)="cancelEdit()"
                [attr.aria-label]="'Отменить редактирование погрузчика ' + element.id"
              >
                <mat-icon>close</mat-icon>
                Отменить
              </button>
            } @else {
              <button
                mat-button
                (click)="editRow(element.id)"
                [attr.aria-label]="'Изменить погрузчик ' + element.id"
              >
                <mat-icon>edit</mat-icon>
                Изменить
              </button>
              <button
                mat-button
                color="warn"
                (click)="deleteRow(element.id)"
                [attr.aria-label]="'Удалить погрузчик ' + element.id"
              >
                <mat-icon>delete</mat-icon>
                Удалить
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
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .table-container {
      position: relative;
      background: white;
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
      color: #666;
      z-index: 10;
    }

    .error-message {
      padding: 1rem;
      background-color: #fee;
      border-left: 4px solid #f44336;
      color: #c62828;
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
    }

    .header-row {
      background-color: #f5f5f5;
      font-weight: 500;
    }

    .data-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
      height: 60px;
    }

    .data-row:hover {
      background-color: #f5f5f5;
    }

    .data-row.selected {
      background-color: #e3f2fd;
    }

    .data-row.selected:hover {
      background-color: #bbdefb;
    }

    .data-row.editing {
      background-color: #fff3e0;
    }

    .column-id {
      width: 100px;
    }

    .column-brand {
      width: 150px;
    }

    .column-number {
      width: 150px;
    }

    .column-loadCapacity {
      width: 150px;
    }

    .column-isActive {
      width: 100px;
      text-align: center;
    }

    .column-lastModified {
      width: 180px;
    }

    .column-lastModifiedBy {
      width: 150px;
    }

    .column-actions {
      width: 250px;
    }

    .edit-field {
      width: 100%;
      margin: 0;
      font-size: 0.9rem;
    }

    .edit-field ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    .edit-field ::ng-deep .mat-mdc-form-field-infix {
      padding: 0.25rem 0;
    }

    .active-icon {
      color: #4caf50;
    }

    .inactive-icon {
      color: #f44336;
    }

    .required {
      color: #f44336;
    }

    .no-data {
      padding: 2rem;
      text-align: center;
      color: #666;
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
      margin-right: 0.25rem;
      vertical-align: middle;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftsTableComponent {
  readonly store = inject(ForkliftsStore);
  private readonly fb = inject(FormBuilder);

  readonly forkliftsList = computed(() => this.store.filteredForklifts());
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

      // Обновляем store данными из формы
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
  }

  selectForklift(id: number): void {
    this.store.selectForklift(id);
  }

  getBrandControl(index: number): FormControl | null {
    return this.getOrCreateForm(index).get('brand') as FormControl | null;
  }

  getNumberControl(index: number): FormControl | null {
    return this.getOrCreateForm(index).get('number') as FormControl | null;
  }

  getLoadCapacityControl(index: number): FormControl | null {
    return this.getOrCreateForm(index).get('loadCapacity') as FormControl | null;
  }

  getIsActiveControl(index: number): FormControl | null {
    return this.getOrCreateForm(index).get('isActive') as FormControl | null;
  }

  isFormValid(id: number): boolean {
    const form = this.rowForms.get(id);
    return form ? form.valid : false;
  }

  private getOrCreateForm(index: number): FormGroup {
    const forkliftsList = this.forkliftsList();
    const element = forkliftsList[index];
    
    if (!element) {
      return this.fb.group({});
    }

    let form = this.rowForms.get(element.id);

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

      this.rowForms.set(element.id, form);
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
}