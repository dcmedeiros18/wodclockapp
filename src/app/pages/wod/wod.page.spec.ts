import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WodPage } from './wod.page';

describe('WodPage', () => {
  let component: WodPage;
  let fixture: ComponentFixture<WodPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
