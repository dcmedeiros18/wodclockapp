import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BookPage } from './book.page';

describe('BookPage', () => {
  let component: BookPage;
  let fixture: ComponentFixture<BookPage>;
  let routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
  let alertControllerSpy = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPage, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
