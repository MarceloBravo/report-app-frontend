import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RegisterRequestInterface } from '../../interfaces/registerRequestInterface';
import { OnboardService } from './onboard-service';

const REQUEST: RegisterRequestInterface = {
  cliente: { nombreEmpresa: 'Acorn Tech', subdominioSlug: 'acorn-tech' },
  usuario: { nombre: 'admin', email: 'admin@acorn.com', password: 'S3cureP@ss_Acorn2025' },
  conexion: {
    host: 'db.acorn.com',
    puerto: 5432,
    dbName: 'analytics',
    dbUser: 'readonly',
    dbPassword: 'secret',
    schemaName: 'public',
  },
};

describe('OnboardService', () => {
  let service: OnboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OnboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('POSTs the request body to /self-serve/registro', () => {
    const response = {
      tenantId: 'tnt-1',
      usuarioId: 'usr-1',
      suscripcionId: 'sub-1',
      dbConnectionId: 'conn-1',
      emailVerificacionUrl: 'https://dataquery.ai/auth/verify?token=abc',
    };

    service.register(REQUEST).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith('/self-serve/registro'),
    );
    expect(req.request.body).toEqual(REQUEST);

    req.flush(response);
  });
});
