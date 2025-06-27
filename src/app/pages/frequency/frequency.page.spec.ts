import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrequencyPage } from './frequency.page';

describe('FrequencyPage', () => {
  let component: FrequencyPage;
  let fixture: ComponentFixture<FrequencyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
