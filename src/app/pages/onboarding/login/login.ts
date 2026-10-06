import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../../shared/ui/icon/icon';
import { LoginServices } from '../../../services/login/login-services';
import { TokenResponseInterface } from '../../../interfaces/tokenResponseInterface';
import { saveRefreshToken } from '../../../utils/refreshToken';
import { Router } from '@angular/router';

type LoginStatus = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './login.html',
  styleUrl: './login.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberSession: [false],
  });

  protected readonly email = this.form.controls.email;
  protected readonly password = this.form.controls.password;

  protected readonly engines = [
    { name: 'PostgreSQL 16', tone: 'primary' },
    { name: 'Oracle', tone: 'tertiary' },
    { name: 'MySQL 8.4', tone: 'secondary' },
  ] as const;

  protected readonly status = signal<LoginStatus>('idle');
  protected readonly passwordVisible = signal(false);

  private pendingAuth?: number;

  private loginServices: LoginServices = inject(LoginServices);
  private router: Router = inject(Router);

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.pendingAuth));
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    if (email && password) {
      this.status.set('loading');
      this.loginServices.postLogin({ email, password }).subscribe({
        next: (response) => {          
          this.loginSuccessful(response as TokenResponseInterface);
        },
        error: (error: any) => {
          this.loginFailed(error);
        }
      });
    }
  }

  private loginSuccessful(response: TokenResponseInterface): void {
    debugger;
    console.log('Login successful:', response);
    this.status.set('success');
    saveRefreshToken(response.refreshToken);
    this.router.navigate(['/register']);
  }

  private loginFailed(error: any): void {
    console.error('Login failed:', error);
    this.form.markAllAsTouched();
    this.status.set('idle');
  }
}
