import { TestBed } from '@angular/core/testing';

import { WodService } from './wod.service';

describe('WodService', () => {
  let service: WodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
