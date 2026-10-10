import { TestBed } from '@angular/core/testing';

import { QueryExecuteService } from './query-execute-service';

describe('QueryExecuteService', () => {
  let service: QueryExecuteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryExecuteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
