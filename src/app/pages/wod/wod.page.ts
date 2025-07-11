import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonTextarea, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonDatetimeButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline } from 'ionicons/icons';
import { RouterModule, Router } from '@angular/router';
import { WodService } from '../../services/wod.service'; // import do seu service
import { AuthService } from 'src/app/services/auth.service'; // ajuste o caminho conforme seu projeto
import { AlertController, ToastController } from '@ionic/angular';


addIcons({
  'barbell-outline': barbellOutline, 
});

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonTextarea, IonDatetimeButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule] 
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
  wodNotes: string = '';           // texto do textarea
  isNoteChanged: boolean = false;  // controla se algo foi digitado
  userProfile: string = ''; // guarda o profile: admin, coach, membership etc.


  constructor(private router: Router, private wodService: WodService, private authService: AuthService, private alertController: AlertController,
    private toastController: ToastController) 
  {
    addIcons({ barbellOutline });
  }

  ngOnInit() {    
    this.userProfile = this.authService.getUserProfile();
    console.log('User Profile:', this.userProfile);
    console.log('Is Admin or Coach:', this.isAdminOrCoach());
    
    // Verificar se o usuário está logado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
    }
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
  
      // Ao selecionar uma nova data, limpa o campo de edição
      this.wodNotes = '';
      this.isNoteChanged = false;
    });
  }
  
  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }

  logout() {
    this.router.navigateByUrl('/login');
  }  

  isAdminOrCoach(): boolean {
    const isAdmin = this.userProfile === 'admin' || this.userProfile === 'coach';
    console.log('Checking admin/coach access:', this.userProfile, 'Result:', isAdmin);
    return isAdmin;
  }
  

  async deleteWod() {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this WOD?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: () => {
            this.wodService.deleteWod(this.selectedDate).subscribe((success) => {
              if (success) {
                this.wodTitle = '';
                this.wodDescription = '';
                this.presentToast('WOD deleted successfully.', 'danger');
              } else {
                this.presentToast('No WOD found to delete.', 'warning');
              }
            });
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  
  editWod() {
    if (this.wodDescription) {
      this.wodNotes = this.wodDescription;
      this.presentToast('Ready to edit.', 'primary');
      this.isNoteChanged = false; // resetar o estado
    }
  }
  
  
  saveWodNotes() {
    if (this.wodNotes.trim()) {
      this.wodService.updateWod(this.selectedDate, {
        description: this.wodNotes
      }).subscribe(success => {
        if (success) {
          this.wodDescription = this.wodNotes;
          this.presentToast('WOD notes saved successfully.', 'success');
          this.isNoteChanged = false;
        } else {
          this.presentToast('Failed to save. No WOD found for this date.', 'warning');
        }
      });
    }
  }
  
  
  onNotesChange() {
    this.isNoteChanged = !!this.wodNotes.trim();
  }
  
  
  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }


  
}
