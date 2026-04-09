import { inject, computed, effect } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withState,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ForkliftsService } from '../../core/services/forklifts.service';
import { DowntimesService } from '../../core/services/downtimes.service';
import type {
  CreateForkliftCommand,
  ForkliftItemDto,
  UpdateForkliftCommand,
} from '../../core/models/forklifts.models';
import type { DowntimeItemDto, UpdateDowntimeCommand } from '../../core/models/downtimes.models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface TestTaskState {
  forklifts: ForkliftItemDto[];
  searchNumber: string;
  editingForkliftId: number | null;
  editingForklift: Partial<ForkliftItemDto>;
  selectedForkliftId: number | null;
  loading: boolean;
  error: string | null;
  downtimes: DowntimeItemDto[];
  downtimesLoading: boolean;
  downtimesError: string | null;
}

const initialState: TestTaskState = {
  forklifts: [],
  searchNumber: '',
  editingForkliftId: null,
  editingForklift: {},
  selectedForkliftId: null,
  loading: false,
  error: null,
  downtimes: [],
  downtimesLoading: false,
  downtimesError: null,
};

export const TestTaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({ forklifts, editingForkliftId, editingForklift }) => ({
      isEditing: computed(() => editingForkliftId() !== null),
      displayForklifts: computed(() => {
        const editingId = editingForkliftId();

        if (editingId === -1 && editingForklift()) {
          const newRecord: ForkliftItemDto = {
            id: -1,
            brand: editingForklift().brand || '',
            number: editingForklift().number || '',
            loadCapacity: editingForklift().loadCapacity || 0,
            isActive: editingForklift().isActive ?? true,
            lastModified: '',
            lastModifiedBy: '',
          };
          return [newRecord, ...forklifts()];
        }

        return forklifts();
      }),
    }),
  ),
  withMethods(
    (
      store,
      forkliftsService = inject(ForkliftsService),
      downtimesService = inject(DowntimesService),
      dialog = inject(MatDialog),
    ) => {
      const loadForklifts = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            forkliftsService
              .getAll({ searchNumber: store.searchNumber(), page: 1, perPage: 1000 })
              .pipe(
                tap((result) => {
                  patchState(store, { forklifts: result.items, loading: false });
                }),
                catchError(() => {
                  patchState(store, { error: 'Ошибка загрузки данных', loading: false });
                  return of(null);
                }),
              ),
          ),
        ),
      );

      return {
        loadForklifts,

        searchByNumber: (number: string) => {
          patchState(store, (state) => ({
            searchNumber: number,
            editingForkliftId: null,
            editingForklift: {},
          }));
          loadForklifts();
        },

        resetFilter: () => {
          patchState(store, { searchNumber: '' });
          loadForklifts();
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
            editingForkliftId: -1,
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
                  id: editingId,
                  isActive: editingForklift.isActive ?? true,
                } as UpdateForkliftCommand);

          return save$.pipe(
            tap(() => {
              patchState(store, {
                editingForkliftId: null,
                editingForklift: {},
              });
              loadForklifts();
            }),
            catchError(() => {
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

        loadDowntimes: (forkliftId: number) => {
          patchState(store, { downtimesLoading: true, downtimesError: null });
          downtimesService.getByForkliftId(forkliftId).subscribe({
            next: (downtimes) => {
              const sorted = [...downtimes].sort(
                (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
              );
              patchState(store, {
                downtimes: sorted,
                downtimesLoading: false,
              });
            },
            error: () => {
              patchState(store, {
                downtimesError: 'Ошибка загрузки простоев',
                downtimesLoading: false,
              });
            },
          });
        },

        clearDowntimes: () => {
          patchState(store, {
            downtimes: [],
            downtimesError: null,
          });
        },

        clearDowntimesError: () => {
          patchState(store, { downtimesError: null });
        },

        resolveDowntime: (id: number) => {
          patchState(store, { downtimesLoading: true, downtimesError: null });
          const downtime = store.downtimes().find((d) => d.id === id);
          if (!downtime) {
            patchState(store, { downtimesLoading: false });
            return;
          }

          const command: UpdateDowntimeCommand = {
            id,
            startedAt: downtime.startedAt,
            endedAt: new Date().toISOString(),
            description: downtime.description,
          };

          downtimesService.update(id, command).subscribe({
            next: () => {
              const selectedForkliftId = store.selectedForkliftId();
              if (selectedForkliftId !== null) {
                downtimesService.getByForkliftId(selectedForkliftId).subscribe({
                  next: (downtimes) => {
                    const sorted = [...downtimes].sort(
                      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
                    );
                    patchState(store, { downtimes: sorted, downtimesLoading: false });
                  },
                });
              }
            },
            error: () => {
              patchState(store, {
                downtimesError: 'Ошибка решения простоя',
                downtimesLoading: false,
              });
            },
          });
        },
      };
    },
  ),
  withHooks({
    onInit: (store) => {
      effect(() => {
        const selectedForkliftId = store['selectedForkliftId']();
        if (selectedForkliftId !== null) {
          store['loadDowntimes'](selectedForkliftId);
        } else {
          store['clearDowntimes']();
        }
      });
    },
  }),
);
