import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConvertQueryRequestInterface } from '../../interfaces/convertQueryRequestInterface';
import { ConvertQueryResponseInterface } from '../../interfaces/convertQueryResponseInterface';
import { readBaseUrl } from '../../utils/config';

@Injectable({
  providedIn: 'root',
})
export class QueryExecuteService {
  private readonly backendUrl: string = readBaseUrl() + '/consultas';

  constructor(private readonly http: HttpClient) {}

  convertir(data: ConvertQueryRequestInterface): Observable<ConvertQueryResponseInterface> {
    return this.http.post<ConvertQueryResponseInterface>(`${this.backendUrl}/convertir`, data);
  }
}