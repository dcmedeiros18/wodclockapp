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
  IonCardTitle, IonFabButton, IonTabButton, IonTabBar, IonTabs, IonLabel, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  barbellOutline,
  clipboardOutline,
  close,
  calendarNumber,
  logOutOutline,
  body, arrowForwardOutline, documentTextOutline } from 'ionicons/icons';
import { WodService } from '../../services/wod.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { MenuComponent } from '../menu/menu.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Register icons globally
addIcons({
  barbellOutline,
  clipboardOutline,
  close,
  calendarNumber,
  logOutOutline,
  body,
});

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonLabel,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonFabButton,
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
    MenuComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WodPage implements OnInit {
  // ==============================
  // PROPERTIES
  // ==============================
  selectedDate: string = '';
  wodTitle: string = '';
  wodDescription: string = '';
  wodNotes: string = '';
  isNoteChanged: boolean = false;
  userProfile: string = '';

  // Motivational quotes carousel
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

  // ==============================
  // CONSTRUCTOR
  // ==============================
  constructor(
    private router: Router,
    private wodService: WodService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
      addIcons({body,clipboardOutline,barbellOutline,close,calendarNumber,logOutOutline,arrowForwardOutline,documentTextOutline});}

  // ==============================
  // LIFECYCLE
  // ==============================
  ngOnInit(): void {
    // Get current user role
    this.userProfile = this.authService.getUserProfile();

    // Redirect if not authenticated
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
    }

    // Start rotating motivational phrases
    setInterval(() => {
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % this.motivationalPhrases.length;
    }, 5000);
  }

  // ==============================
  // DATE SELECTION HANDLER
  // ==============================
  onDateSelected(event: any): void {
    const isoDate = event.detail.value;
    const dateOnly = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = dateOnly;

    // Fetch WOD by date
    this.wodService.getWod(this.selectedDate).subscribe((wod: any) => {
      this.wodTitle = wod?.title || '';
      this.wodDescription = wod?.description || '';
      this.wodNotes = '';
      this.isNoteChanged = false;
    });
  }

  // ==============================
  // ROLE CHECK
  // ==============================
  isAdminOrCoach(): boolean {
    return this.userProfile === 'admin' || this.userProfile === 'coach';
  }

  // ==============================
  // NAVIGATION
  // ==============================
  logout(): void {
    this.router.navigateByUrl('/login');
  }

  goToUserMembership(): void {
    this.router.navigateByUrl('/user-membership');
  }

  goToBook(): void {
    this.router.navigateByUrl('/book');
  }

  goToWod(): void {
    this.router.navigateByUrl('/wod');
  }

  goToCancel(): void {
    this.router.navigateByUrl('/cancel');
  }

  goToHistory(): void {
    this.router.navigateByUrl('/frequency');
  }

  // ==============================
  // ADMIN/COACH ACTIONS
  // ==============================

  // Confirm and delete WOD
  async deleteWod(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this WOD?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
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

  // Prepare WOD for editing
  editWod(): void {
    if (this.wodDescription) {
      this.wodNotes = this.wodDescription;
      this.isNoteChanged = true;
      this.presentToast('You can now edit this WOD.', 'primary');
    }
  }

  // Save or create WOD
  saveWodNotes(): void {
    if (!this.wodNotes.trim()) return;

    const wodData = {
      date: this.selectedDate,
      title: 'Workout of the Day',
      description: this.wodNotes,
    };

    this.wodService.updateWod(this.selectedDate, { description: this.wodNotes }).subscribe({
      next: () => {
        this.wodDescription = this.wodNotes;
        this.wodTitle = 'Workout of the Day';
        this.wodNotes = '';
        this.isNoteChanged = false;
        this.presentToast('WOD updated successfully.', 'success');
      },
      error: (err) => {
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

  // ==============================
  // EVENT HANDLERS
  // ==============================

  onNotesChange(): void {
    this.isNoteChanged = !!this.wodNotes.trim();
  }

  // ==============================
  // TOAST UTILITY
  // ==============================
  async presentToast(message: string, color: string = 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  // ===============================
  // Feedback users
  // ===============================
  openGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScEUHsealcBUmCo-xD5mQkHQLjCN7IGqwCRhQuQz_v9n-g-9A/viewform?usp=header');
  }
}
