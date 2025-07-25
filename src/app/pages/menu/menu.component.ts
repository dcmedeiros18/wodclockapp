import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonTabs, IonIcon, IonTabButton, IonTabBar, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }
  goToBook() {
    this.router.navigateByUrl('/book');
  }
  goToWod() {
    this.router.navigateByUrl('/wod');
  }
  goToCancel() {
    this.router.navigateByUrl('/cancel');
  }
  goToFrequency() {
    this.router.navigateByUrl('/frequency');
  }
  goToHistory() {
    this.router.navigateByUrl('/frequency');
  }
}
