import { inject, Injectable, computed } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ForkliftsService } from '../../core/services/forklifts.service';
import type {
  CreateForkliftCommand,
  ForkliftItemDto,
  UpdateForkliftCommand,
} from '../../core/models/forklifts.models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface ForkliftsState {
  forklifts: ForkliftItemDto[];
  searchNumber: string;
  editingForkliftId: number | null;
  editingForklift: Partial<ForkliftItemDto>;
  selectedForkliftId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ForkliftsState = {
  forklifts: [],
  searchNumber: '',
  editingForkliftId: null,
  editingForklift: {},
  selectedForkliftId: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ForkliftsStore extends signalStore(
  withState(initialState),
  withComputed(({ forklifts, searchNumber, editingForkliftId }) => ({
    filteredForklifts: computed(() => {
      const search = searchNumber().toLowerCase().trim();
      if (!search) {
        return forklifts();
      }
      return forklifts().filter((f) => f.number.toLowerCase().includes(search));
    }),
    isEditing: computed(() => editingForkliftId() !== null),
  })),
  withMethods(
    (
      store,
      forkliftsService = inject(ForkliftsService),
      dialog = inject(MatDialog),
    ) => ({
      loadForklifts: () => {
        patchState(store, { loading: true, error: null });
        return forkliftsService.getAll().pipe(
          tap((result) => {
            patchState(store, {
              forklifts: result.items,
              loading: false,
            });
          }),
          catchError((error) => {
            patchState(store, {
              error: 'Ошибка загрузки данных',
              loading: false,
            });
            return of(null);
          }),
        );
      },

      searchByNumber: (number: string) => {
        patchState(store, { searchNumber: number });
      },

      resetFilter: () => {
        patchState(store, { searchNumber: '' });
      },

      startEditing: (id: number) => {
        const forklift = store.forklifts().find((f) => f.id === id);
        if (forklift) {
          patchState(store, {
            editingForkliftId: id,
            editingForklift: { ...forklift },
          });
        }
      },

      startAdding: () => {
        patchState(store, {
          editingForkliftId: -1, // -1 означает новую запись
          editingForklift: {
            brand: '',
            number: '',
            loadCapacity: 0,
            isActive: true,
          },
        });
      },

      updateEditingField: <K extends keyof Partial<ForkliftItemDto>>(
        field: K,
        value: ForkliftItemDto[K],
      ) => {
        patchState(store, (state) => ({
          editingForklift: {
            ...state.editingForklift,
            [field]: value,
          },
        }));
      },

      save: () => {
        const editingId = store.editingForkliftId();
        const editingForklift = store.editingForklift();

        if (editingId === null || !editingForklift) {
          return of(null);
        }

        const command = {
          brand: editingForklift.brand || '',
          number: editingForklift.number || '',
          loadCapacity: editingForklift.loadCapacity || 0,
        };

        const save$ =
          editingId === -1
            ? forkliftsService.create(command)
            : forkliftsService.update(editingId, {
                ...command,
                isActive: editingForklift.isActive ?? true,
              } as UpdateForkliftCommand);

        return save$.pipe(
          tap((result) => {
            if (editingId === -1) {
              // Новая запись создана
              const newForklift: ForkliftItemDto = {
                id: result as number,
                brand: command.brand,
                number: command.number,
                loadCapacity: command.loadCapacity,
                isActive: true,
                lastModified: new Date().toISOString(),
                lastModifiedBy: null,
              };
              patchState(store, (state) => ({
                forklifts: [...state.forklifts, newForklift],
                editingForkliftId: null,
                editingForklift: {},
              }));
            } else {
              // Существующая запись обновлена
              patchState(store, (state) => ({
                forklifts: state.forklifts.map((f) =>
                  f.id === editingId
                    ? {
                        ...f,
                        ...command,
                        isActive: editingForklift.isActive ?? f.isActive,
                      }
                    : f,
                ),
                editingForkliftId: null,
                editingForklift: {},
              }));
            }
          }),
          catchError((error) => {
            patchState(store, { error: 'Ошибка сохранения данных' });
            return of(null);
          }),
        );
      },

      cancel: () => {
        const dialogRef = dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Отмена изменений',
            message: 'Не сохранять внесенные изменения? Вы уверены?',
          },
        });

        return dialogRef.afterClosed().pipe(
          tap((confirmed) => {
            if (confirmed) {
              patchState(store, {
                editingForkliftId: null,
                editingForklift: {},
              });
            }
          }),
        );
      },

      delete: (id: number) => {
        const dialogRef = dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Удаление погрузчика',
            message: 'Удалить погрузчик? Вы уверены?',
          },
        });

        return dialogRef.afterClosed().pipe(
          tap((confirmed) => {
            if (confirmed) {
              patchState(store, { loading: true, error: null });
              forkliftsService.delete(id).subscribe({
                next: () => {
                  patchState(store, (state) => ({
                    forklifts: state.forklifts.filter((f) => f.id !== id),
                    selectedForkliftId:
                      state.selectedForkliftId === id ? null : state.selectedForkliftId,
                    loading: false,
                  }));
                },
                error: (error) => {
                  // Проверка на наличие простоев
                  if (error.status === 400) {
                    patchState(store, {
                      error: 'Невозможно удалить погрузчик: есть зарегистрированные простои',
                      loading: false,
                    });
                  } else {
                    patchState(store, {
                      error: 'Ошибка удаления погрузчика',
                      loading: false,
                    });
                  }
                },
              });
            }
          }),
        );
      },

      selectForklift: (id: number) => {
        patchState(store, { selectedForkliftId: id });
      },

      clearError: () => {
        patchState(store, { error: null });
      },
    }),
  ),
) {}