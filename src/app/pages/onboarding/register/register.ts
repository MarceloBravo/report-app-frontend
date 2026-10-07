import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RegisterRequestInterface } from '../../../interfaces/registerRequestInterface';
import { OnboardService } from '../../../services/onboarding/onboard-service';
import { Icon } from '../../../shared/ui/icon/icon';

type RegisterStatus = 'idle' | 'loading' | 'success' | 'error';
type PasswordField = 'master' | 'db';

const STRENGTH_LEVELS = [
  { min: 0, label: 'Débil', tone: 'error', bars: 1 },
  { min: 6, label: 'Media', tone: 'warning', bars: 2 },
  { min: 10, label: 'Alta', tone: 'primary', bars: 4 },
] as const;

type StrengthLevel = (typeof STRENGTH_LEVELS)[number];

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './register.html',
  styleUrl: './register.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboardService = inject(OnboardService);

  protected readonly form = this.formBuilder.nonNullable.group({
    nombreEmpresa: ['', Validators.required],
    subdominioSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    host: ['', Validators.required],
    puerto: [5432, [Validators.required, Validators.min(1), Validators.max(65535)]],
    dbName: ['', Validators.required],
    schemaName: ['', Validators.required],
    dbUser: ['', Validators.required],
    dbPassword: ['', Validators.required],
  });

  protected readonly status = signal<RegisterStatus>('idle');
  protected readonly errorMessage = signal('');
  protected readonly visiblePassword = signal<PasswordField | null>(null);
  protected readonly strength = signal<StrengthLevel>(STRENGTH_LEVELS[0]);

  private readonly slug = this.form.controls.subdominioSlug;
  private readonly password = this.form.controls.password;

  protected readonly slugPreview = toSignal(this.slug.valueChanges, {
    initialValue: this.slug.value,
  });

  constructor() {
    this.password.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const level = [...STRENGTH_LEVELS].reverse().find((l) => value.length >= l.min);
      this.strength.set(level ?? STRENGTH_LEVELS[0]);
    });
  }

  protected get domainLabel(): string {
    return `https://${this.slugPreview() || 'tu-empresa'}.dataquery.ai`;
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  protected togglePasswordVisibility(field: PasswordField): void {
    this.visiblePassword.update((current) => (current === field ? null : field));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('loading');
    this.onboardService.register(this.buildRequest()).subscribe({
      next: () => this.status.set('success'),
      error: (error: HttpErrorResponse) => this.onRequestError(error),
    });
  }

  protected openStudio(): void {
    const slug = this.slug.value || 'tu-empresa';
    window.open(`https://${slug}.dataquery.ai/studio/workbench`, '_blank');
  }

  private buildRequest(): RegisterRequestInterface {
    const formValue = this.form.getRawValue();

    return {
      cliente: {
        nombreEmpresa: formValue.nombreEmpresa,
        subdominioSlug: formValue.subdominioSlug,
      },
      usuario: {
        nombre: formValue.nombre,
        email: formValue.email,
        password: formValue.password,
      },
      conexion: {
        host: formValue.host,
        puerto: Number(formValue.puerto),
        dbName: formValue.dbName,
        dbUser: formValue.dbUser,
        dbPassword: formValue.dbPassword,
        schemaName: formValue.schemaName,
      },
    };
  }

  private onRequestError(error: HttpErrorResponse): void {
    const messages: Record<number, string> = {
      400: 'Revisa los datos del formulario: algunos campos son inválidos.',
      409: 'Ya existe una organización registrada con ese subdominio.',
      502: 'El servicio de provisioning no está disponible. Inténtalo más tarde.',
    };

    this.errorMessage.set(messages[error.status] ?? 'No se pudo completar el registro.');
    this.status.set('error');
  }
}
