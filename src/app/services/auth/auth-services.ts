import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CredentialsInterface } from '../../interfaces/credentialsInterface';
import { MeResponseInterface } from '../../interfaces/meResponseInterface';
import { SessionResponseInterface } from '../../interfaces/sessionResponseInterface';
import { readBaseUrl } from '../../utils/config';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private readonly backendUrl: string = readBaseUrl() + '/auth';

  constructor(private readonly http: HttpClient) {}

  login(data: CredentialsInterface): Observable<SessionResponseInterface> {
    return this.http.post<SessionResponseInterface>(`${this.backendUrl}/login`, data);
  }

  refresh(): Observable<SessionResponseInterface> {
    return this.http.post<SessionResponseInterface>(`${this.backendUrl}/refresh`, {});
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.backendUrl}/logout`, {});
  }

  me(): Observable<MeResponseInterface> {
    return this.http.get<MeResponseInterface>(`${this.backendUrl}/me`);
  }
}