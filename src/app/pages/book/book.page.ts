import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassService, ClassSlot } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonDatetime,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCheckbox
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonDatetime,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCheckbox
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookPage implements OnInit {
  selectedDate: string = '';
  timeSlots: ClassSlot[] = [];
  selectedClassIds: number[] = [];
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  // Runs when component initializes
  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Event listener to refresh available classes when needed
    window.addEventListener('classesUpdated', (e: any) => {
      const updatedDate = e?.detail?.date || this.selectedDate;
      if (updatedDate) {
        this.onDateSelected({ detail: { value: updatedDate } });
      }
    });

    // Load classes if date is already selected
    if (this.selectedDate) {
      this.onDateSelected({ detail: { value: this.selectedDate } });
    }
  }

  // Allow weekdays only (Sunday blocked)
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  };

  // Verify if current user is admin or coach
  isAdminOrCoach(): boolean {
    const profile = this.authService.getUserProfile();
    return profile === 'admin' || profile === 'coach';
  }

  // Check if a class is already in the past
  isPastClass(slot: ClassSlot): boolean {
    const now = new Date();
    const classTime = new Date(`${this.selectedDate}T${slot.time}`);
    return classTime.getTime() <= now.getTime();
  }

  // Check if the user can still cancel the class (at least 2h before start)
  canCancelClass(slot: ClassSlot): boolean {
    const now = new Date();
    const classTime = new Date(`${this.selectedDate}T${slot.time}`);
    const diffMinutes = (classTime.getTime() - now.getTime()) / 60000;
    return diffMinutes >= 120;
  }

  // Toggle class selection (used by admin/coach for multi-cancel)
  toggleSelectClass(classId: number) {
    if (this.selectedClassIds.includes(classId)) {
      this.selectedClassIds = this.selectedClassIds.filter(id => id !== classId);
    } else {
      this.selectedClassIds.push(classId);
    }
  }

  // Open confirmation alert for canceling selected classes
  confirmCancelSelected() {
    const selectedClasses = this.timeSlots.filter(c => this.selectedClassIds.includes(c.id));
    const message =
      'Are you sure you want to cancel the following classes? This action is irreversible.' +
      '\n\n' +
      selectedClasses.map(c => `Date: ${this.selectedDate} - Time: ${c.time}`).join('\n');

    this.alertController.create({
      header: 'Confirm',
      message,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => this.cancelSelectedClasses()
        }
      ]
    }).then(alert => alert.present());
  }

  // Cancel the selected class slots (admin/coach)
  cancelSelectedClasses() {
    for (const classId of this.selectedClassIds) {
      this.classService.cancelClass(classId).subscribe({
        next: () => {
          const slot = this.timeSlots.find(s => s.id === classId);
          if (slot) {
            slot.cancelled = true;
          }
        },
        error: (err) => {
          console.error('Error canceling class:', err);
        }
      });
    }
    this.selectedClassIds = [];
    this.successMessage = 'Classes cancelled successfully.';
  }

  // Triggered when a new date is selected in the calendar
  onDateSelected(event: any): void {
    const isoDate = event.detail.value;
    const datePart = isoDate && isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not authenticated. Please log in again.';
      this.router.navigateByUrl('/login');
      return;
    }

    this.classService.getAvailableClasses(this.selectedDate).subscribe({
      next: (slots) => {
        // Add 'cancelled' property based on backend status
        this.timeSlots = slots.map(slot => ({
          ...slot,
          cancelled: slot.status === 'cancelled'
        }));
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.timeSlots = [];
        if (error.status === 401 || error.status === 403) {
          this.router.navigateByUrl('/login');
        }
      }
    });
  }

  // Book a class for the user
  bookClass(classId: number) {
    const slot = this.timeSlots.find(s => s.id === classId);
    if (!classId || isNaN(classId)) {
      this.errorMessage = 'Invalid class ID!';
      return;
    }
    if (slot && this.isPastClass(slot)) {
      this.errorMessage = 'It is not possible to book a class that has already been held.';
      return;
    }
    this.classService.bookClass(classId).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Class successfully booked.';
        this.errorMessage = '';
        const bookedSlot = this.timeSlots.find(slot => slot.id === classId);
        if (bookedSlot) {
          bookedSlot.alreadyBooked = true;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error booking class.';
        this.successMessage = '';
      }
    });
  }

  // Navigation Methods
  goToWod() {
    this.router.navigateByUrl('/wod');
  }

  goToCancel() {
    this.router.navigateByUrl('/cancel');
  }

  goToFrequency() {
    this.router.navigateByUrl('/frequency');
  }

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }

  goToBook() {
    this.router.navigateByUrl('/book');
  }

  // Clears token and returns to login
  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
