import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonDatetimeButton, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { clipboardOutline } from 'ionicons/icons';

addIcons({
  'clipboard': clipboardOutline
});

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule, IonDatetime, IonDatetimeButton, IonModal, IonCardTitle, IonCardContent,
    IonChip, RouterModule]
})
export class BookPage implements OnInit {
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0; // Habilita todos os dias exceto domingo
  };

  selectedDate: string = '';
  timeSlots: { time: string, spots: number }[] = [];

  constructor(private router: Router) {
    addIcons({ clipboardOutline });
  }

  ngOnInit() {}

  onDateSelected(event: any) {
    this.selectedDate = event.detail.value;
  
    // Aqui você pode ligar no service futuramente!
    this.timeSlots = [
      { time: '06:00 am', spots: 20 },
      { time: '07:00 am', spots: 20 },
      { time: '08:00 am', spots: 20 },
      { time: '04:00 pm', spots: 20 },
      { time: '05:00 pm', spots: 20 },
      { time: '06:00 pm', spots: 20 },
      { time: '07:00 pm', spots: 20 },
      { time: '08:00 pm', spots: 20 },
    ];
  }
  
  bookClass(slotIndex: number) {
    if (this.timeSlots[slotIndex].spots > 0) {
      this.timeSlots[slotIndex].spots--;
    }
  }
  
  goToWod() {
    this.router.navigateByUrl('/wod');
  }

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }
}