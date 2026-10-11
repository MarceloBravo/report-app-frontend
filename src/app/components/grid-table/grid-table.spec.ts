import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTable } from './grid-table';

describe('GridTable', () => {
  let component: GridTable;
  let fixture: ComponentFixture<GridTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridTable],
    }).compileComponents();

    fixture = TestBed.createComponent(GridTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders headers and converts cell values by type', () => {
    fixture.componentRef.setInput('headers', ['ID', 'ACTIVO', 'FECHA', 'VACIO']);
    fixture.componentRef.setInput('rows', [
      ['A1', true, '2024-10-01T14:30:05', null],
      ['A2', false, '2024-11-15T09:05:00', undefined],
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Sí');
    expect(text).toContain('No');
    expect(text).toContain('01/10/2024 14:30:05');
    expect(text).toContain('15/11/2024 09:05:00');
  });

  it('hides the id column but keeps the other columns', () => {
    fixture.componentRef.setInput('headers', ['ID', 'NOMBRE']);
    fixture.componentRef.setInput('rows', [['1', 'Alice']]);
    fixture.componentRef.setInput('idColumn', 'id');
    fixture.detectChanges();

    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('th'),
      (element: Element) => element.textContent?.trim(),
    );

    expect(headers).toEqual(['NOMBRE']);
    expect(fixture.nativeElement.textContent).toContain('Alice');
  });

  it('does not render column headers when headers are not provided', () => {
    fixture.componentRef.setInput('rows', [['solo-dato']]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('thead')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('solo-dato');
  });

  it('shows the empty message and hides the toolbar when there are no rows', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sin resultados para mostrar');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
