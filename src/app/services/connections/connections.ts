import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConnectionResponseInterface } from '../../interfaces/connectionResponseInterface';
import { readBaseUrl } from '../../utils/config';

@Injectable({
  providedIn: 'root',
})
export class Connections {
  private readonly backendUrl: string = readBaseUrl() + '/conexiones';

  constructor(private readonly http: HttpClient) {}

  getConnections(): Observable<ConnectionResponseInterface[]> {
    return this.http.get<ConnectionResponseInterface[]>(this.backendUrl);
  }
}
