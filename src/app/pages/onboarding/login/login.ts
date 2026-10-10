import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../../shared/ui/icon/icon';
import { AuthServices } from '../../../services/auth/auth-services';
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

  private authServices: AuthServices = inject(AuthServices);
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
      this.authServices.login({ email, password }).subscribe({
        next: () => {
          this.loginSuccessful();
        },
        error: () => {
          this.loginFailed();
        }
      });
    }
  }

  private loginSuccessful(): void {
    this.status.set('success');
    this.router.navigate(['/query-execute']);
  }

  private loginFailed(): void {
    this.form.markAllAsTouched();
    this.status.set('idle');
  }
}
