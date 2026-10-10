import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryExecute } from './query-execute';

describe('QueryExecute', () => {
  let component: QueryExecute;
  let fixture: ComponentFixture<QueryExecute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryExecute],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryExecute);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
