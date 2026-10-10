import { TestBed } from '@angular/core/testing';

import { Connections } from './connections';

describe('Connections', () => {
  let service: Connections;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Connections);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
