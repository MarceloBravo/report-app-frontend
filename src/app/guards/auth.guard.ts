import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthServices } from '../services/auth/auth-services';

export const sessionGuard: CanActivateFn = () => {
  const authServices = inject(AuthServices);
  const router = inject(Router);

  return authServices.me().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    }),
  );
};