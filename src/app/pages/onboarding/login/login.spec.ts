import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const query = <T extends Element>(selector: string) =>
    fixture.nativeElement.querySelector(selector) as T;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
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

  it('should walk through the loading and success states on a valid submit', async () => {
    const email = query<HTMLInputElement>('#email');
    email.value = 'analyst@empresa.com';
    email.dispatchEvent(new Event('input'));

    const password = query<HTMLInputElement>('#password');
    password.value = 'secreto';
    password.dispatchEvent(new Event('input'));

    await fixture.whenStable();

    vi.useFakeTimers();
    query<HTMLButtonElement>('.submit').click();
    fixture.detectChanges();

    const submit = query<HTMLButtonElement>('.submit');
    expect(submit.disabled).toBe(true);
    expect(submit.textContent).toContain('Verificando credenciales...');

    vi.advanceTimersByTime(1200);
    fixture.detectChanges();
    expect(submit.textContent).toContain('Autenticado con éxito');

    vi.useRealTimers();
  });
});
