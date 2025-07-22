import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonDatetime, IonButton,
  IonDatetimeButton, IonModal, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonTextarea, IonLabel,
  IonList, IonItem, IonFabButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import {
  calendarNumber, clipboardOutline, barbellOutline,
  close, logOutOutline, person, body, arrowForwardOutline, documentTextOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';

// Register all icons used in the component
addIcons({
  body, clipboardOutline, barbellOutline, close,
  calendarNumber, logOutOutline, person
});

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.page.html',
  styleUrls: ['./frequency.page.scss'],
  standalone: true,
  imports: [IonFabButton, 
    IonLabel, IonList, IonItem, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonTextarea, IonModal,
    IonDatetimeButton, IonButton, IonDatetime, IonIcon,
    IonContent, CommonModule, FormsModule
  ]
})
export class FrequencyPage implements OnInit {

  // ==============================
  // PROPERTIES
  // ==============================
  startDateValue: string | null = null;
  endDateValue: string | null = null;
  totalClasses: number | null = null;
  highlightedDates: any[] = [];
  showCalendar = false;
  errorMessage: string | null = null;

  // Personal goal tracking
  personalGoalInput: string = '';
  personalGoals: { text: string; date: string }[] = [];
  selectedGoalIndex: number | null = null;

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private alertController: AlertController
  ) {
      addIcons({body,clipboardOutline,barbellOutline,close,calendarNumber,logOutOutline,arrowForwardOutline,documentTextOutline});}

  // ==============================
  // LIFECYCLE HOOK
  // ==============================
  ngOnInit() {
    this.loadGoalsFromStorage(); // Load personal goals from localStorage on component init
  }

  // ==============================
  // PERSONAL GOALS METHODS
  // ==============================

  // Save a new goal and persist it to localStorage
  saveGoal() {
    const trimmed = this.personalGoalInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newGoal = { text: trimmed, date: formattedDate };
    this.personalGoals.push(newGoal);
    this.personalGoalInput = '';
    this.saveGoalsToStorage();
  }

  // Set index of selected goal (to prepare for deletion)
  selectGoalToDelete(index: number) {
    this.selectedGoalIndex = index;
  }

  // Confirm deletion with alert before removing goal
  async confirmDeleteGoal() {
    const selected = this.personalGoals[this.selectedGoalIndex!];

    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete this goal?\n"${selected.text}"`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.personalGoals.splice(this.selectedGoalIndex!, 1);
            this.selectedGoalIndex = null;
            this.saveGoalsToStorage();
          },
        },
      ],
    });

    await alert.present();
  }

  // Save all goals to localStorage
  saveGoalsToStorage() {
    localStorage.setItem('personalGoals', JSON.stringify(this.personalGoals));
  }

  // Load goals from localStorage on component init
  loadGoalsFromStorage() {
    const stored = localStorage.getItem('personalGoals');
    if (stored) {
      this.personalGoals = JSON.parse(stored);
    }
  }

  // ==============================
  // DATE RANGE & VALIDATION
  // ==============================

  // Only allow weekdays (Monday to Saturday)
  isWeekday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getUTCDay();
    return day !== 0; // Exclude Sundays
  };

  // Validate selected start and end dates
  onDateChange() {
    this.errorMessage = null;

    if (!this.startDateValue || !this.endDateValue) {
      this.errorMessage = 'Select both start and end dates.';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(this.startDateValue);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.endDateValue);
    end.setHours(0, 0, 0, 0);

    if (end > today) {
      this.errorMessage = 'End date cannot be in the future.';
      return;
    }

    if (start > end) {
      this.errorMessage = 'Start date must be before end date.';
      return;
    }
  }

  // ==============================
  // FETCH USER BOOKING HISTORY
  // ==============================

  async calculateHistory(): Promise<void> {
    this.showCalendar = false;
    this.errorMessage = null;

    this.onDateChange(); // Validate before proceeding
    if (this.errorMessage) {
      this.totalClasses = null;
      this.highlightedDates = [];
      return;
    }

    try {
      const bookingsRaw = await this.classService
        .getUserBookingsByPeriod(this.startDateValue!, this.endDateValue!)
        .toPromise();

      const bookings = Array.isArray(bookingsRaw) ? bookingsRaw : [];

      // Filter out cancelled bookings
      const activeBookings = bookings.filter((b: any) => b.status !== 'cancelled');
      this.totalClasses = activeBookings.length;

      // Highlight selected date range
      const highlights: any[] = [];
      const start = new Date(this.startDateValue!);
      const end = new Date(this.endDateValue!);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        highlights.push({
          date: d.toISOString().split('T')[0],
          textColor: 'white',
          backgroundColor: 'red',
          borderColor: 'red'
        });
      }

      this.highlightedDates = highlights;
      this.showCalendar = true;
    } catch (err) {
      this.totalClasses = 0;
      this.highlightedDates = [];
      this.showCalendar = true;
    }
  }

  // ==============================
  // NAVIGATION
  // ==============================

  logout() {
    localStorage.removeItem('token');
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

   // ===============================
  // Feedback users
  // ===============================
  openGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScEUHsealcBUmCo-xD5mQkHQLjCN7IGqwCRhQuQz_v9n-g-9A/viewform?usp=header');
  }
}
