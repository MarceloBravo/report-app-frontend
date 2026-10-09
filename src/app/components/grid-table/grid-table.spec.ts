import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTable } from './grid-table';

describe('GridTable', () => {
  let component: GridTable;
  let fixture: ComponentFixture<GridTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
