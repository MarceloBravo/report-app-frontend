import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthServices } from '../../../services/auth/auth-services';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServicesMock: { login: ReturnType<typeof vi.fn> };
  let navigateMock: ReturnType<typeof vi.fn>;

  const query = <T extends Element>(selector: string) =>
    fixture.nativeElement.querySelector(selector) as T;

  const fillCredentials = async () => {
    const email = query<HTMLInputElement>('#email');
    email.value = 'analyst@empresa.com';
    email.dispatchEvent(new Event('input'));

    const password = query<HTMLInputElement>('#password');
    password.value = 'secreto';
    password.dispatchEvent(new Event('input'));

    await fixture.whenStable();
  };

  beforeEach(async () => {
    authServicesMock = { login: vi.fn() };
    navigateMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthServices, useValue: authServicesMock },
        { provide: Router, useValue: { navigate: navigateMock } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the password visibility', async () => {
    const input = query<HTMLInputElement>('#password');

    expect(input.type).toBe('password');

    query<HTMLButtonElement>('.field__action').click();
    await fixture.whenStable();
    expect(input.type).toBe('text');

    query<HTMLButtonElement>('.field__action').click();
    await fixture.whenStable();
    expect(input.type).toBe('password');
  });

  it('should show the validation errors and keep the idle state on an empty submit', async () => {
    query<HTMLButtonElement>('.submit').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.field__error').length).toBe(2);
    expect(query<HTMLButtonElement>('.submit').disabled).toBe(false);
    expect(query<HTMLButtonElement>('.submit').textContent).toContain('Iniciar Sesión');
  });

  it('should show the success state and not store tokens on a valid login', async () => {
    authServicesMock.login.mockReturnValue(
      of({ tokenType: 'Bearer', expiresIn: 900, refreshExpiresIn: 604800 }),
    );
    await fillCredentials();

    query<HTMLButtonElement>('.submit').click();
    await fixture.whenStable();

    expect(authServicesMock.login).toHaveBeenCalledWith({
      email: 'analyst@empresa.com',
      password: 'secreto',
    });
    expect(navigateMock).toHaveBeenCalledWith(['/register']);
    expect(query<HTMLButtonElement>('.submit').textContent).toContain('Autenticado con éxito');
  });

  it('should stay idle and show errors when the login fails', async () => {
    authServicesMock.login.mockReturnValue(throwError(() => new Error('Credenciales inválidas')));
    await fillCredentials();

    query<HTMLButtonElement>('.submit').click();
    await fixture.whenStable();

    expect(query<HTMLButtonElement>('.submit').disabled).toBe(false);
    expect(query<HTMLButtonElement>('.submit').textContent).toContain('Iniciar Sesión');
  });
});