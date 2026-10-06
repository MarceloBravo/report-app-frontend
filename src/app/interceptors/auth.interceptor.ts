import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthServices } from '../services/auth/auth-services';

const LOGIN_PATH = '/auth/login';
const REFRESH_PATH = '/auth/refresh';

let isRefreshing = false;
let refreshDone$: BehaviorSubject<boolean> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServices = inject(AuthServices);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (req.url.endsWith(REFRESH_PATH) || req.url.endsWith(LOGIN_PATH)) {
        return throwError(() => error);
      }

      if (isRefreshing && refreshDone$) {
        return refreshDone$.pipe(
          filter((done) => done),
          take(1),
          switchMap(() => next(req)),
        );
      }

      isRefreshing = true;
      refreshDone$ = new BehaviorSubject<boolean>(false);

      return authServices.refresh().pipe(
        switchMap(() => {
          isRefreshing = false;
          refreshDone$?.next(true);
          refreshDone$?.complete();
          refreshDone$ = null;
          return next(req);
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshDone$?.complete();
          refreshDone$ = null;
          authServices.logout().subscribe({ error: () => undefined });
          router.navigate(['/']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};