import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RegisterRequestInterface } from '../../interfaces/registerRequestInterface';
import { RegisterResponseInterface } from '../../interfaces/registerResponseInterface';
import { readBaseUrl } from '../../utils/config';

@Injectable({
  providedIn: 'root',
})
export class OnboardService {
  private readonly backendUrl: string = readBaseUrl() + '/self-serve';

  constructor(private readonly http: HttpClient) {}

  register(data: RegisterRequestInterface): Observable<RegisterResponseInterface> {
    return this.http.post<RegisterResponseInterface>(`${this.backendUrl}/registro`, data);
  }
}
