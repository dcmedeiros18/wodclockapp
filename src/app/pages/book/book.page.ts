import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonDatetimeButton, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonButton } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonButton, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonDatetime, IonDatetimeButton, IonModal, IonCardTitle, IonCardContent, IonChip]
})
export class BookPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  timeSlots = [
    { time: '06:00 am', spots: 5 },
    { time: '07:00 am', spots: 6 },
    { time: '04:30 pm', spots: 6 },
    { time: '05:30 pm', spots: 4 },
    { time: '06:30 pm', spots: 2 }
  ];
  
}
