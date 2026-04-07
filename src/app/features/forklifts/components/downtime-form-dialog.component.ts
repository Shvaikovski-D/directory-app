import { Component, computed, inject, signal } from '@angular/core';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 class="dialog-title">Проблемы с погрузчиком? Опишите</h2>

    <mat-dialog-content>
      <div class="downtime-form">
        <!-- ПОЛЯ ДАТЫ И ВРЕМЕНИ -->
        <div class="date-fields-row">
          <div style="display: flex; flex-direction: column;">
            <div class="date-field">
              <span class="field-label">начало</span>
              <input
                matInput
                type="datetime-local"
                [value]="startedAt()"
                (input)="onStartedAtInput($event)"
              />
            </div>

            @if (!isStartedValid()) {
              <mat-error><small>Поле обязательно</small></mat-error>
            }
          </div>

          <div style="display: flex; flex-direction: column;">
            <div class="date-field">
              <span class="field-label">окончание</span>
              <div style="display: flex; flex-direction: column;">
                <input
                  type="datetime-local"
                  [value]="endedAt() ?? ''"
                  (input)="onEndedAtInput($event)"
                />
              </div>
            </div>
            @if (!isEndedValid()) {
              <mat-error><small>Окончание должно быть больше начала</small></mat-error>
            }
          </div>
        </div>

        <!-- ОПИСАНИЕ -->
        <div class="date-field-description">
          <span class="field-label">описание инцидента</span>
          <textarea
            rows="12"
            [value]="description()"
            (input)="onDescriptionInput($event)"
            (blur)="descriptionTouched.set(true)"
          ></textarea>

          @if (!isDescriptionValid() && descriptionTouched()) {
            <mat-error><small>Поле обязательно</small></mat-error>
          }
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button
        mat-button
        class="btn-save"
        color="primary"
        (click)="onSave()"
        [disabled]="!isFormValid()"
      >
        Сохранить
      </button>
      <button mat-button class="btn-cancel" (click)="onCancel()">Выход</button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
      background-color: var(--md-sys-color-surface-container-high);
      padding: 0.5rem;
    }

    .dialog-title {
      margin: 0;
      padding: 1rem 1.5rem 0.5rem;
      font-size: 1.25rem;
      border-bottom: 1px solid red;
    }

    .downtime-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 500px;
      padding-top: 0.5rem;
    }

    .date-fields-row {
      display: flex;
      flex-direction: row;
      align-items: start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .date-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .field-label {
      padding-right: 0.1rem;
      white-space: nowrap;
      font-size: 1.25rem;
      color: black;
    }

    .date-field mat-form-field {
      flex: 1;
    }

    .form-field {
      width: 100%;
    }

    input {
      font-size: 1.1rem;
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      border: 1px solid gray;
    }

    .date-field-description {
      display: flex;
      flex-direction: column;

      > span {
        padding-bottom: 0.5rem;
      }
    }

    textarea {
      resize: vertical;
      min-height: 80px;
      border-radius: 8px;
      font-size: 1.2rem;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      justify-content: space-around;
    }

    button[mat-button][disabled] {
      opacity: 0.5;
    }

    .btn-cancel {
      background-color: var(--md-sys-color-on-surface-variant);
      width: 25%;
    }

    .btn-save {
      background-color: var(--md-sys-color-primary) !important;
      color: var(--md-sys-color-on-primary) !important;
      width: 25%;
    }

    .btn-save:hover:not([disabled]),
    .btn-cancel:hover:not([disabled]) {
      opacity: 0.9;
    }

    .btn-save:active:not([disabled]),
    .btn-cancel:active:not([disabled]) {
      opacity: 0.8;
    }

    mat-error {
      color: red;
    }
  `,
})
export class DowntimeFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DowntimeFormDialogComponent>);
  readonly data = inject<DowntimeFormDialogData>(MAT_DIALOG_DATA);

  readonly startedAt = signal<string>('');
  readonly endedAt = signal<string | null>(null);
  readonly description = signal<string>('');

  readonly startedTouched = signal(false);
  readonly descriptionTouched = signal(false);

  readonly isDescriptionValid = computed(() => this.description().trim().length > 0);
  readonly isStartedValid = computed(() => !!this.startedAt());
  readonly isEndedValid = computed(() => {
    if (!this.endedAt() || !this.isStartedValid()) return true;

    const start = new Date(this.startedAt()!);
    const end = new Date(this.endedAt()!);
    return end > start;
  });
  readonly isFormValid = computed(
    () => this.isStartedValid() && this.isEndedValid() && this.isDescriptionValid(),
  );

  constructor() {
    if (this.data.mode === 'edit' && this.data.downtime) {
      const d = this.data.downtime;
      this.startedAt.set(this.toLocalDateTime(d.startedAt));
      this.endedAt.set(d.endedAt ? this.toLocalDateTime(d.endedAt) : null);
      this.description.set(d.description);
    } else {
      const now = new Date();
      this.startedAt.set(this.toLocalDateTime(now.toISOString()));
    }
  }

  // Convert ISO → datetime-local
  private toLocalDateTime(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  // Convert datetime-local → ISO (UTC without timezone offset)
  private toUtcIso(value: string | null): string | null {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  // INPUT HANDLERS
  onStartedAtInput(e: Event) {
    this.startedAt.set((e.target as HTMLInputElement).value);
  }

  onEndedAtInput(e: Event) {
    this.endedAt.set((e.target as HTMLInputElement).value || null);
  }

  onDescriptionInput(e: Event) {
    this.description.set((e.target as HTMLTextAreaElement).value);
  }

  // ACTIONS
  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.startedTouched.set(true);
    this.descriptionTouched.set(true);

    if (!this.isFormValid()) return;

    const startedIso = this.toUtcIso(this.startedAt());
    const endedIso = this.toUtcIso(this.endedAt());

    if (this.data.mode === 'create') {
      this.dialogRef.close({
        forkliftId: this.data.forkliftId,
        startedAt: startedIso!,
        endedAt: endedIso,
        description: this.description().trim(),
      });
    } else {
      this.dialogRef.close({
        id: this.data.downtime!.id,
        startedAt: startedIso!,
        endedAt: endedIso,
        description: this.description().trim(),
      });
    }
  }
}
