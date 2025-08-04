import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FrequencyPage } from './frequency.page';

describe('FrequencyPage', () => {
  let component: FrequencyPage;
  let fixture: ComponentFixture<FrequencyPage>;
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
      imports: [FrequencyPage, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FrequencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
