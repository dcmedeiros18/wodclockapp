import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonDatetimeButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline } from 'ionicons/icons';
import { RouterModule, Router } from '@angular/router';
import { WodService } from '../../services/wod.service'; // import do seu service
import { AuthService } from 'src/app/services/auth.service'; // ajuste o caminho conforme seu projeto

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
    return utcDay !== 0;
  };

  selectedDate: string = '';
  wodTitle: string = '';
  wodDescription: string = '';
  wodNotes: string = ''; // para caixa de texto
  userRole: string = ''; // armaxena o perfil

  constructor(private router: Router, private wodService: WodService, private authService: AuthService) 
  {
    addIcons({ barbellOutline });
  }

  ngOnInit() {
    // this.userRole = this.authService.getUserProfile(); 
  }

  onDateSelected(event: any) {
    const isoDate = event.detail.value;
    const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;

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

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }

  logout() {
    this.router.navigateByUrl('/login');
  }

  editWod() {
    console.log('Editar WOD - implementar funcionalidade');
  }

  deleteWod() {
    console.log('Deletar WOD - implementar funcionalidade');
  }

  isAdminOrCoach(): boolean {
    return this.userRole === 'admin' || this.userRole === 'coach';
  }
}
