import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import {
  ForkliftItemDto,
  CreateForkliftCommand,
  UpdateForkliftCommand,
  PagedResultModelOfForkliftItemDto,
} from '../models/forklifts.models';

export interface GetForkliftsParams {
  searchNumber?: string;
  page?: number;
  perPage?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ForkliftsService {
  private readonly httpService = inject(HttpService);
  private readonly forkliftsPath = environment.apiPaths.forklifts;

  getAll(params?: GetForkliftsParams): Observable<PagedResultModelOfForkliftItemDto> {
    const queryParams = new URLSearchParams();

    if (params?.searchNumber) {
      queryParams.append('searchNumber', params.searchNumber);
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.perPage !== undefined) {
      queryParams.append('perPage', params.perPage.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.forkliftsPath}?${queryString}` : this.forkliftsPath;

    return this.httpService.get<PagedResultModelOfForkliftItemDto>(endpoint);
  }

  getById(id: number): Observable<ForkliftItemDto> {
    return this.httpService.get<ForkliftItemDto>(`${this.forkliftsPath}/${id}`);
  }

  create(request: CreateForkliftCommand): Observable<number> {
    return this.httpService.post<number>(this.forkliftsPath, request);
  }

  update(id: number, request: UpdateForkliftCommand): Observable<never> {
    return this.httpService.put<never>(`${this.forkliftsPath}/${id}`, request);
  }

  delete(id: number): Observable<never> {
    return this.httpService.delete<never>(`${this.forkliftsPath}/${id}`);
  }

  restore(id: number): Observable<never> {
    return this.httpService.post<never>(`${this.forkliftsPath}/${id}/restore`, {});
  }

  hardDelete(id: number): Observable<never> {
    return this.httpService.delete<never>(`${this.forkliftsPath}/${id}/hard-delete`);
  }
}