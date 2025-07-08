import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonDatetimeButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline } from 'ionicons/icons';
import { RouterModule, Router } from '@angular/router';
import { WodService } from '../../services/wod.service'; // import do seu service

addIcons({
  'barbell-outline': barbellOutline, 
});

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonDatetimeButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule] 
})
export class WodPage implements OnInit {

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0; // Desativa domingo
  };

  selectedDate: string = '';
  wodTitle: string = '';
  wodDescription: string = '';

  constructor(private router: Router, private wodService: WodService) {
    addIcons({ barbellOutline });
  }

  ngOnInit() {}

  /**
   * Quando o usuário seleciona uma data no calendário
   */
  onDateSelected(event: any) {
    const isoDate = event.detail.value;
    console.log('Raw date value:', isoDate);

    // Garante o formato YYYY-MM-DD
    const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;
    console.log('Selected date:', this.selectedDate);

    // Chama o service (no futuro, ligue ao backend real aqui)
    this.wodService.getWod(this.selectedDate).subscribe((wod: any) => {
      if (wod) {
        this.wodTitle = wod.title;
        this.wodDescription = wod.description;
      } else {
        this.wodTitle = '';
        this.wodDescription = '';
      }
    });
  }

  /**
   * Navega para a home do usuário
   */
  goToUserMembership() {   
    this.router.navigateByUrl('/user-membership'); // caminho certo
  }

}
