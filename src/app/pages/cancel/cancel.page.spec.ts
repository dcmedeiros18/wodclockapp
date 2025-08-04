import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CancelPage } from './cancel.page';

describe('CancelPage', () => {
  let component: CancelPage;
  let fixture: ComponentFixture<CancelPage>;
  let routerSpy = { 
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
    serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('')
  };
  let navControllerSpy = { 
    navigateBack: jasmine.createSpy('navigateBack'), 
    navigateForward: jasmine.createSpy('navigateForward') 
  };
  let activatedRouteSpy = { snapshot: { params: {} } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelPage, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CancelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
