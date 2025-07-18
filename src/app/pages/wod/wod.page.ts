import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonTextarea,
  IonDatetime,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barbellOutline,
  clipboardOutline,
  close,
  calendarNumber,
  logOutOutline, body } from 'ionicons/icons';
import { RouterModule, Router } from '@angular/router';
import { WodService } from '../../services/wod.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';

// Add required Ionicons
addIcons({
  'barbell-outline': barbellOutline,
});

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
  standalone: true,
  imports: [
    IonTextarea,
    IonIcon,
    IonContent,
    CommonModule,
    FormsModule,
    IonDatetime,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    RouterModule,
  ],
})
export class WodPage implements OnInit {
  // DATE AND DATA 

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0; // disable Sundays
  };

  selectedDate: string = '';
  wodTitle: string = '';
  wodDescription: string = '';
  wodNotes: string = '';
  isNoteChanged: boolean = false;
  userProfile: string = '';

  // MOTIVATIONAL QUOTE CAROUSEL 

  motivationalPhrases: string[] = [
    'No pain, no gain!',
    'You are stronger than you think.',
    'Every rep counts!',
    'Discipline beats motivation.',
    'Push yourself beyond the limits!',
    'Train insane or remain the same.',
    "Don’t stop when you're tired. Stop when you're done.",
  ];

  currentPhraseIndex: number = 0;

  constructor(
    private router: Router,
    private wodService: WodService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({body,clipboardOutline,barbellOutline,close,calendarNumber,logOutOutline,});
  }

  // INITIALIZATION 

  ngOnInit() {
    // Load current user profile
    this.userProfile = this.authService.getUserProfile();
    console.log('User Profile:', this.userProfile);
    console.log('Is Admin or Coach:', this.isAdminOrCoach());

    // Redirect to login if no user is found
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
    }

    // Start rotating motivational quotes every 5 seconds
    setInterval(() => {
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % this.motivationalPhrases.length;
    }, 5000);
  }

  // DATE SELECTION LOGIC 

  onDateSelected(event: any) {
    const isoDate = event.detail.value;
    const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;

    // Fetch WOD from backend
    this.wodService.getWod(this.selectedDate).subscribe((wod: any) => {
      if (wod) {
        this.wodTitle = wod.title;
        this.wodDescription = wod.description;
      } else {
        this.wodTitle = '';
        this.wodDescription = '';
      }

      // Clear editing state
      this.wodNotes = '';
      this.isNoteChanged = false;
    });
  }

  // NAVIGATION 

  logout() {
    this.router.navigateByUrl('/login');
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

  goToHistory() {
    this.router.navigateByUrl('/frequency');
  }

  // ROLE CHECK 

  isAdminOrCoach(): boolean {
    const isAdmin =
      this.userProfile === 'admin' || this.userProfile === 'coach';
    console.log(
      'Checking admin/coach access:',
      this.userProfile,
      'Result:',
      isAdmin
    );
    return isAdmin;
  }

  // ACTIONS FOR ADMIN/COACH 

  async deleteWod() {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this WOD?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
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
          },
        },
      ],
    });

    await alert.present();
  }

  editWod() {
    if (this.wodDescription) {
      this.wodNotes = this.wodDescription;
      this.isNoteChanged = true;
      this.presentToast('You can now edit this WOD.', 'primary');
    }
  }

  saveWodNotes() {
    if (!this.wodNotes.trim()) return;

    const wodData = {
      date: this.selectedDate,
      title: 'Workout of the Day',
      description: this.wodNotes,
    };

    // Try to update first
    this.wodService
      .updateWod(this.selectedDate, { description: this.wodNotes })
      .subscribe({
        next: () => {
          this.wodDescription = this.wodNotes;
          this.wodTitle = 'Workout of the Day';
          this.wodNotes = '';
          this.isNoteChanged = false;
          this.presentToast('WOD updated successfully.', 'success');
        },
        error: (err) => {
          // If not found, create new WOD
          if (err.status === 404) {
            this.wodService.createWod(wodData).subscribe({
              next: (created) => {
                this.wodTitle = created.title;
                this.wodDescription = created.description;
                this.wodNotes = '';
                this.isNoteChanged = false;
                this.presentToast('WOD created successfully.', 'success');
              },
              error: () => {
                this.presentToast('Failed to create WOD.', 'danger');
              },
            });
          } else {
            this.presentToast('Unexpected error saving WOD.', 'danger');
          }
        },
      });
  }

  //  EDIT FIELD LISTENER

  onNotesChange() {
    this.isNoteChanged = !!this.wodNotes.trim();
  }

  //  TOAST UTILITY 

  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
