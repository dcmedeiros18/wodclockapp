import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMembershipPage } from './user-membership.page';

describe('UserMembershipPage', () => {
  let component: UserMembershipPage;
  let fixture: ComponentFixture<UserMembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
