import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonDatetime, IonButton,
  IonDatetimeButton, IonModal, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonTextarea, IonLabel,
  IonList, IonItem
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import {
  calendarNumber, clipboardOutline, barbellOutline,
  close, logOutOutline, person, body
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';


// Registering icons globally
addIcons({
  body, clipboardOutline, barbellOutline, close,
  calendarNumber, logOutOutline, person
});

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.page.html',
  styleUrls: ['./frequency.page.scss'],
  standalone: true,
  imports: [
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

  // Goal tracking
  personalGoalInput: string = '';
  personalGoals: { text: string; date: string }[] = [];
  selectedGoalIndex: number | null = null;

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private alertController: AlertController

  ) { }

  // ==============================
  // LIFECYCLE
  // ==============================
  ngOnInit() {
    this.loadGoalsFromStorage(); // Load personal goals from localStorage
  }

  // ==============================
  // PERSONAL GOALS METHODS
  // ==============================

  // Save a new goal to the list and persist to localStorage
  saveGoal() {
    const trimmed = this.personalGoalInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newGoal = {
      text: trimmed,
      date: formattedDate,
    };

    this.personalGoals.push(newGoal);
    this.personalGoalInput = '';
    this.saveGoalsToStorage();
  }

  // Set index of selected goal (for deletion)
  selectGoalToDelete(index: number) {
    this.selectedGoalIndex = index;
  }

  // Show confirm alert and delete selected goal
  async confirmDeleteGoal() {
    const selected = this.personalGoals[this.selectedGoalIndex!];

    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete this goal?"${selected.text}"`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            // Do nothing on cancel
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            // Remove goal from array
            this.personalGoals.splice(this.selectedGoalIndex!, 1);
            this.selectedGoalIndex = null;
            this.saveGoalsToStorage();
          },
        },
      ],
    });

    await alert.present();
  }


  // Save goal list to localStorage
  saveGoalsToStorage() {
    localStorage.setItem('personalGoals', JSON.stringify(this.personalGoals));
  }

  // Load saved goals from localStorage
  loadGoalsFromStorage() {
    const stored = localStorage.getItem('personalGoals');
    if (stored) {
      this.personalGoals = JSON.parse(stored);
    }
  }

  // ==============================
  // DATE RANGE & VALIDATION
  // ==============================

  // Only allow weekdays (Monday–Saturday)
  isWeekday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0; // Block Sundays
  };

  // Validate selected dates
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
      this.errorMessage = 'End date cannot be greater than today.';
      return;
    }

    if (start > end) {
      this.errorMessage = 'Start date cannot be greater than end date.';
      return;
    }
  }

  // ==============================
  // CALCULATE USER HISTORY
  // ==============================

  async calculateHistory(): Promise<void> {
    this.showCalendar = false;
    this.errorMessage = null;
    this.onDateChange();

    if (this.errorMessage) {
      this.totalClasses = null;
      this.highlightedDates = [];
      return;
    }

    const startDate = this.startDateValue as string;
    const endDate = this.endDateValue as string;

    try {
      const bookingsRaw = await this.classService.getUserBookingsByPeriod(startDate, endDate).toPromise();
      const bookings = Array.isArray(bookingsRaw) ? bookingsRaw : [];

      // Filter out cancelled bookings
      const activeBookings = bookings.filter((b: any) => b.status !== 'cancelled');
      this.totalClasses = activeBookings.length;

      // Highlight range between selected dates
      const highlights: any[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

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
  // NAVIGATION METHODS
  // ==============================

  logout() {
    localStorage.removeItem('token');
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
}
