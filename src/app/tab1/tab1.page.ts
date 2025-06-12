import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonInput,IonInputPasswordToggle, IonItem, IonRippleEffect, IonButton, IonLabel, IonIcon, IonImg } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
 

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonImg, IonIcon, IonLabel, IonButton, IonRippleEffect, IonItem, IonInput,IonInputPasswordToggle, IonFooter, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page {
  constructor() {}
}
