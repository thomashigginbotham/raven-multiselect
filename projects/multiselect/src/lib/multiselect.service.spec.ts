import { TestBed } from '@angular/core/testing';

import { MultiselectService } from './multiselect.service';

describe('MultiselectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultiselectService = TestBed.get(MultiselectService);
    expect(service).toBeTruthy();
  });
});
