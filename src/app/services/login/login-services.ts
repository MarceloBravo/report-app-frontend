import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { readBaseUrl } from '../../utils/config';
import { CredentialsInterface } from '../../interfaces/credentialsInterface';


@Injectable({
  providedIn: 'root',
})
export class LoginServices {
  backendUrl: string = readBaseUrl() + '/auth';
  
  constructor(private http: HttpClient) {}

  postLogin(data: CredentialsInterface) {
    return this.http.post(`${this.backendUrl}/login`, data);
  }

  postLogOut() {
    return this.http.post(`${this.backendUrl}/logout`, {});
  }
  
}
