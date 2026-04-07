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
        <!-- НАЧАЛО -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>начало</mat-label>

          <input
            matInput
            type="datetime-local"
            [value]="startedAt()"
            (input)="onStartedAtInput($event)"
          />

          @if (!isStartedValid() && startedTouched()) {
            <mat-error>Поле обязательно</mat-error>
          }
        </mat-form-field>

        <!-- ОКОНЧАНИЕ -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>окончание</mat-label>

          <input
            matInput
            type="datetime-local"
            [value]="endedAt() ?? ''"
            (input)="onEndedAtInput($event)"
          />
        </mat-form-field>

        <!-- ОПИСАНИЕ -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>описание инцидента</mat-label>
          <textarea
            matInput
            rows="4"
            [value]="description()"
            (input)="onDescriptionInput($event)"
            (blur)="descriptionTouched.set(true)"
          ></textarea>

          @if (!isDescriptionValid() && descriptionTouched()) {
            <mat-error>Минимум 1 символ</mat-error>
          }
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button color="primary" (click)="onSave()" [disabled]="!isFormValid()">
        Сохранить
      </button>
      <button mat-button (click)="onCancel()">Выход</button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }

    .dialog-title {
      margin: 0;
      padding: 1rem 1.5rem 0.5rem;
      font-size: 1.25rem;
    }

    .downtime-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 500px;
      padding-top: 0.5rem;
    }

    .form-field {
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
  private readonly dialogRef = inject(MatDialogRef<DowntimeFormDialogComponent>);
  readonly data = inject<DowntimeFormDialogData>(MAT_DIALOG_DATA);

  readonly startedAt = signal<string>('');
  readonly endedAt = signal<string | null>(null);
  readonly description = signal<string>('');

  readonly startedTouched = signal(false);
  readonly descriptionTouched = signal(false);

  readonly isDescriptionValid = computed(() => this.description().trim().length > 0);
  readonly isStartedValid = computed(() => !!this.startedAt());
    readonly isFormValid = computed(() => this.isStartedValid() && this.isDescriptionValid());

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
