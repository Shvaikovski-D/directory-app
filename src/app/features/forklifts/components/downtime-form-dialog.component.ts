import { Component, inject, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialogRef, MatDialogContent, MatDialogTitle, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import type { DowntimeItemDto } from '../../../core/models/downtimes.models';
import { toLocalISOString } from '../../../utils/date.utils';

export interface DowntimeFormDialogData {
  mode: 'create' | 'edit';
  forkliftId: number;
  downtime?: DowntimeItemDto;
}

@Component({
  selector: 'app-downtime-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Проблемы с погрузчиком ? Опишите</h2>
    <mat-dialog-content>
      <form [formGroup]="downtimeForm" class="downtime-form">
        <!-- Начало простоя -->
        <div class="form-row">
          <mat-form-field class="form-field">
            <mat-label>начало</mat-label>
            <input
              matInput
              type="datetime-local"
              formControlName="startedAt"
              [attr.aria-label]="'Дата и время начала простоя'"
            />
            <mat-icon matSuffix (click)="openStartDatePicker()">
              calendar_today
            </mat-icon>
            @if (startedAtControl.invalid && startedAtControl.touched) {
              <mat-error>Поле обязательно для заполнения</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="form-field empty-field"></mat-form-field>
        </div>

        <!-- Окончание простоя -->
        <div class="form-row">
          <mat-form-field class="form-field">
            <mat-label>окончание</mat-label>
            <input
              matInput
              type="datetime-local"
              formControlName="endedAt"
              [attr.aria-label]="'Дата и время окончания простоя'"
            />
            <mat-icon matSuffix (click)="openEndDatePicker()">
              calendar_today
            </mat-icon>
          </mat-form-field>

          <mat-form-field class="form-field empty-field"></mat-form-field>
        </div>

        <!-- Скрытые datepicker'ы для выбора даты -->
        <input
          #startedDatePickerTrigger
          [matDatepicker]="startedDatePicker"
          style="display: none;"
        />
        <mat-datepicker #startedDatePicker (dateChange)="onStartDateChange($event)" />

        <input
          #endedDatePickerTrigger
          [matDatepicker]="endedDatePicker"
          style="display: none;"
        />
        <mat-datepicker #endedDatePicker (dateChange)="onEndDateChange($event)" />

        <!-- Описание инцидента -->
        <mat-form-field class="form-field description-field">
          <mat-label>описание инцидента</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
            [attr.aria-label]="'Описание инцидента'"
          ></textarea>
          @if (descriptionControl.invalid && descriptionControl.touched) {
            <mat-error>Минимум 1 символ</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-button
        (click)="onCancel()"
        [attr.aria-label]="'Отмена'"
      >
        Выход
      </button>
      <button
        mat-button
        color="primary"
        (click)="onSave()"
        [disabled]="downtimeForm.invalid || downtimeForm.pristine"
        [attr.aria-label]="'Сохранить простой'"
      >
        Сохранить
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }

    .downtime-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 500px;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-field {
      width: 100%;
    }

    .form-row .form-field {
      flex: 1;
    }

    .empty-field {
      opacity: 0;
      pointer-events: none;
    }

    .description-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
    }
  `,
})
export class DowntimeFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DowntimeFormDialogComponent>);
  readonly data = inject<DowntimeFormDialogData>(MAT_DIALOG_DATA);

  readonly downtimeForm: FormGroup = this.fb.group({
    startedAt: ['', [Validators.required]],
    endedAt: [null],
    description: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly startedAtControl = this.downtimeForm.get('startedAt') as FormControl<string>;
  readonly endedAtControl = this.downtimeForm.get('endedAt') as FormControl<string | null>;
  readonly descriptionControl = this.downtimeForm.get('description') as FormControl<string>;

  @ViewChild('startedDatePicker') startedDatePicker!: MatDatepicker<Date>;
  @ViewChild('endedDatePicker') endedDatePicker!: MatDatepicker<Date>;

  constructor() {
    if (this.data.mode === 'edit' && this.data.downtime) {
      // Заполняем форму данными для редактирования
      const downtime = this.data.downtime;

      // Форматируем для datetime-local: YYYY-MM-DDTHH:mm
      const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const startDate = new Date(downtime.startedAt);
      const endDate = downtime.endedAt ? new Date(downtime.endedAt) : null;

      this.downtimeForm.patchValue({
        startedAt: formatDateTimeLocal(startDate),
        endedAt: endDate ? formatDateTimeLocal(endDate) : null,
        description: downtime.description,
      });
    } else {
      // Для создания устанавливаем текущую дату/время
      const now = new Date();
      const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      this.downtimeForm.patchValue({
        startedAt: formatDateTimeLocal(now),
      });
    }
  }

  openStartDatePicker(): void {
    this.startedDatePicker.open();
  }

  openEndDatePicker(): void {
    this.endedDatePicker.open();
  }

  onStartDateChange(event: any): void {
    const date = event.value as Date | null;
    if (date) {
      const formatDateTimeLocal = (d: Date): string => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      this.startedAtControl.setValue(formatDateTimeLocal(date));
    }
  }

  onEndDateChange(event: any): void {
    const date = event.value as Date | null;
    if (date) {
      const formatDateTimeLocal = (d: Date): string => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      this.endedAtControl.setValue(formatDateTimeLocal(date));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.downtimeForm.invalid) {
      this.downtimeForm.markAllAsTouched();
      return;
    }

    const formValue = this.downtimeForm.value;

    // Конвертируем datetime-local в ISO с часовым поясом
    const parseDateTimeLocal = (value: string | null): string | null => {
      if (!value) return null;
      const date = new Date(value);
      return toLocalISOString(date);
    };

    const startedAt = parseDateTimeLocal(formValue.startedAt);
    const endedAt = parseDateTimeLocal(formValue.endedAt);

    if (this.data.mode === 'create') {
      const createCommand = {
        forkliftId: this.data.forkliftId,
        startedAt: startedAt!,
        endedAt: endedAt,
        description: formValue.description || '',
      };

      this.dialogRef.close(createCommand);
    } else {
      const updateCommand = {
        id: this.data.downtime!.id,
        startedAt: startedAt!,
        endedAt: endedAt,
        description: formValue.description || '',
      };

      this.dialogRef.close(updateCommand);
    }
  }
}
