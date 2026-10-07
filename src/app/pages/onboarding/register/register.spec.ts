import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';

const VALID_FORM = {
  nombreEmpresa: 'Acorn Tech',
  subdominioSlug: 'acorn-tech',
  nombre: 'admin_acorn',
  email: 'contacto@acorn.com',
  password: 'S3cureP@ss_Acorn2025',
  host: 'db.acorn-internal.aws.com',
  puerto: 5432,
  dbName: 'production_analytics',
  schemaName: 'public',
  dbUser: 'readonly_ai_user',
  dbPassword: 'pg_ro_98df8',
};

const EXPECTED_BODY = {
  cliente: { nombreEmpresa: 'Acorn Tech', subdominioSlug: 'acorn-tech' },
  usuario: { nombre: 'admin_acorn', email: 'contacto@acorn.com', password: 'S3cureP@ss_Acorn2025' },
  conexion: {
    host: 'db.acorn-internal.aws.com',
    puerto: 5432,
    dbName: 'production_analytics',
    dbUser: 'readonly_ai_user',
    dbPassword: 'pg_ro_98df8',
    schemaName: 'public',
  },
};

const SUCCESS_RESPONSE = {
  tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  usuarioId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  suscripcionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  dbConnectionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  emailVerificacionUrl: 'https://dataquery.ai/auth/verify?token=abc',
};

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;
  let httpMock: HttpTestingController;

  const form = () => component['form'];
  const status = () => component['status']();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  function submitValidForm(): void {
    form().setValue(VALID_FORM);
    component['onSubmit']();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not call the backend when the form is invalid', () => {
    component['onSubmit']();

    expect(form().touched).toBe(true);
    httpMock.expectNone(() => true);
  });

  it('posts the mapped payload to /self-serve/registro', async () => {
    submitValidForm();

    const req = httpMock.expectOne(
      (request) => request.method === 'POST' && request.url.endsWith('/self-serve/registro'),
    );
    expect(req.request.body).toEqual(EXPECTED_BODY);

    req.flush(SUCCESS_RESPONSE);
    await fixture.whenStable();

    expect(status()).toBe('success');
  });

  it('shows an error message when the backend rejects the request', async () => {
    submitValidForm();

    const req = httpMock.expectOne((request) => request.url.endsWith('/self-serve/registro'));
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(status()).toBe('error');
    expect(component['errorMessage']()).toContain('subdominio');
  });
});
