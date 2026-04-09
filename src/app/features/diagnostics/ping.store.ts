import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ForkliftsService } from '../../core/services/forklifts.service';

export interface PingResult {
  id: number;
  timestamp: Date;
  status: 'success' | 'error';
  responseTime?: number;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class PingStore implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly forkliftsService = inject(ForkliftsService);

  //private readonly PING_URL = 'https://directory-app-2r3o.onrender.com';
  public readonly PING_URL = 'https://google.com';
  private readonly PING_INTERVAL_MS = 600000; // 10 минут

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private nextId = 1;

  // Сигналы состояния
  readonly isRunning = signal(false);
  readonly pingResults = signal<PingResult[]>([]);

  ngOnDestroy(): void {
    this.stopPing();
  }

  startPing(): void {
    if (this.isRunning()) {
      return;
    }

    this.isRunning.set(true);
    
    // Сразу отправляем первый запрос
    this.sendPingRequest();

    // Запускаем периодические запросы
    this.intervalId = setInterval(() => {
      this.sendPingRequest();
    }, this.PING_INTERVAL_MS);
  }

  stopPing(): void {
    if (!this.isRunning()) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning.set(false);
  }

  private sendPingRequest(): void {
    const startTime = performance.now();

    this.forkliftsService
      .getAll({ page: 1, perPage: 1000 })
      .pipe(
        tap(() => {
          const responseTime = performance.now() - startTime;
          this.addPingResult({
            id: this.nextId++,
            timestamp: new Date(),
            status: 'success',
            responseTime,
          });
        }),
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          const responseTime = performance.now() - startTime;
          this.addPingResult({
            id: this.nextId++,
            timestamp: new Date(),
            status: 'error',
            responseTime,
            error: error.message || 'Неизвестная ошибка',
          });
        },
      });
  }

  private addPingResult(result: PingResult): void {
    this.pingResults.update((results) => {
      // Храним только последние 20 результатов
      const newResults = [result, ...results];
      return newResults.slice(0, 20);
    });
  }

  clearResults(): void {
    this.pingResults.set([]);
  }
}