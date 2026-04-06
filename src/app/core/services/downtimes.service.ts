import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import {
  DowntimeItemDto,
  CreateDowntimeCommand,
  UpdateDowntimeCommand,
} from '../models/downtimes.models';

@Injectable({
  providedIn: 'root',
})
export class DowntimesService {
  private readonly httpService = inject(HttpService);
  private readonly downtimesPath = environment.apiPaths.downtimes;

  getByForkliftId(forkliftId: number): Observable<DowntimeItemDto[]> {
    const endpoint = `${this.downtimesPath}?forkliftId=${forkliftId}`;
    return this.httpService.get<DowntimeItemDto[]>(endpoint);
  }

  getById(id: number): Observable<DowntimeItemDto> {
    return this.httpService.get<DowntimeItemDto>(`${this.downtimesPath}/${id}`);
  }

  create(request: CreateDowntimeCommand): Observable<number> {
    return this.httpService.post<number>(this.downtimesPath, request);
  }

  update(id: number, request: UpdateDowntimeCommand): Observable<never> {
    return this.httpService.put<never>(`${this.downtimesPath}/${id}`, request);
  }

  delete(id: number): Observable<never> {
    return this.httpService.delete<never>(`${this.downtimesPath}/${id}`);
  }
}