import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WodService } from './wod.service';

describe('WodService', () => {
  let service: WodService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(WodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
