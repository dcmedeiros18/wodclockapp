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
  IonCheckbox
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  body, clipboardOutline, barbellOutline,
  close, calendarNumber, logOutOutline, person, documentTextOutline, arrowDownOutline, arrowForwardOutline
} from 'ionicons/icons';

// Registering icons globally
addIcons({
  body, clipboardOutline, barbellOutline,
  close, calendarNumber, logOutOutline, person
});

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
    IonCheckbox,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookPage implements OnInit {

  // ===============================
  // Component State
  // ===============================
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
  ) {
    addIcons({ body, clipboardOutline, barbellOutline, close, calendarNumber, logOutOutline, arrowForwardOutline, documentTextOutline, arrowDownOutline });
  }

  // ===============================
  // Component Initialization
  // ===============================
  // Declare this as a class-level property, outside ngOnInit
  loadingClasses = false;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Adiciona listener para atualização externa
    window.addEventListener('classesUpdated', (e: any) => {
      const updatedDate = e?.detail?.date || this.selectedDate;
      if (updatedDate) {
        this.onDateSelected({ detail: { value: updatedDate } });
      }
    });

    // Set today as default if no date is selected
    if (!this.selectedDate) {
      const today = new Date();
      // Fix timezone to ensure correct local date
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      this.selectedDate = localDate.toISOString().split('T')[0];
    }

    console.log('[ngOnInit] Auto-loading classes for date:', this.selectedDate);
    // Load classes automatically for the selected date
    this.onDateSelected({ detail: { value: this.selectedDate } });
  }

  // ===============================
  // Allow only weekdays (disable Sundays)
  // ===============================
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getUTCDay() !== 0;
  };

  // ===============================
  // Check if user is admin or coach
  // ===============================
  isAdminOrCoach(): boolean {
    const profile = this.authService.getUserProfile();
    return profile === 'admin' || profile === 'coach';
  }

  // ===============================
  // Check if class is in the past
  // ===============================
  isPastClass(slot: ClassSlot): boolean {
    const now = new Date();
    const classTime = new Date(`${this.selectedDate}T${slot.time}`);
    return classTime.getTime() <= now.getTime();
  }

  // ===============================
  // Check if cancellation is allowed (2 hours before)
  // ===============================
  canCancelClass(slot: ClassSlot): boolean {
    const now = new Date();
    const classTime = new Date(`${this.selectedDate}T${slot.time}`);
    const diffMinutes = (classTime.getTime() - now.getTime()) / 60000;
    return diffMinutes >= 120;
  }

  // ===============================
  // Admin/Coach: toggle class selection
  // ===============================
  toggleSelectClass(classId: number) {
    if (this.selectedClassIds.includes(classId)) {
      this.selectedClassIds = this.selectedClassIds.filter(id => id !== classId);
    } else {
      this.selectedClassIds.push(classId);
    }
  }

  // ===============================
  // Admin/Coach: confirm cancellation of selected classes
  // ===============================
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

  // ===============================
  // Admin/Coach: cancel selected classes
  // ===============================
  cancelSelectedClasses() {
    for (const classId of this.selectedClassIds) {
      this.classService.cancelClass(classId).subscribe({
        next: () => {
          const slot = this.timeSlots.find(s => s.id === classId);
          if (slot) slot.cancelled = true;
        },
        error: (err) => console.error('Error canceling class:', err)
      });
    }

    this.selectedClassIds = [];
    this.successMessage = 'Classes cancelled successfully.';
  }

  // ===============================
  // Load classes based on selected date
  // ===============================
  onDateSelected(event: any): void {
    console.log('[onDateSelected] Starting...', event);

    const isoDate = event.detail.value;
    const datePart = isoDate && isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('[onDateSelected] Loading classes for date:', this.selectedDate);

    // Validate date format
    if (!this.selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(this.selectedDate)) {
      this.errorMessage = 'Invalid date format';
      this.loadingClasses = false;
      return;
    }

    // Check if date is not too far in the future (maximum 1 year)
    const selectedDateObj = new Date(this.selectedDate);
    const today = new Date();
    const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    if (selectedDateObj > oneYearFromNow) {
      this.errorMessage = 'Date too far in the future';
      this.loadingClasses = false;
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const token = localStorage.getItem('token');
    
    if (!currentUser || !token) {
      this.errorMessage = 'Session expired. Please log in again.';
      localStorage.removeItem('token');
      this.router.navigateByUrl('/login');
      this.loadingClasses = false;
      return;
    }

    // Set loading and clear previous slots
    this.loadingClasses = true;
    this.timeSlots = [];

    console.log('[onDateSelected] Making API call with token:', token ? 'Token present' : 'No token');

    this.classService.getAvailableClasses(this.selectedDate).subscribe({
      next: (slots) => {
        console.log('[onDateSelected] Backend response:', slots);
        this.loadingClasses = false;

        if (!slots) {
          console.log('[onDateSelected] No slots received');
          this.timeSlots = [];
          return;
        }

        // Apply filter to remove duplicates
        const uniqueSlots = slots.filter(
          (slot, index, self) =>
            index === self.findIndex(
              s => s.time === slot.time && s.date === slot.date
            )
        );

        this.timeSlots = uniqueSlots.map(slot => ({
          ...slot,
          cancelled: slot.status === 'cancelled'
        }));

        console.log('[onDateSelected] Final timeSlots:', this.timeSlots);
      },
      error: (error) => {
        console.error('[onDateSelected] Error details:', error);
        this.loadingClasses = false;
        this.timeSlots = [];

        if (error.status === 401) {
          this.errorMessage = 'Session expired. Redirecting to login...';
          localStorage.removeItem('token');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 2000);
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid date format or incorrect parameters';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Check your permissions.';
        } else if (error.status === 404) {
          this.errorMessage = 'No classes found for this date.';
        } else {
          this.errorMessage = error.message || 'Error loading classes. Please try again.';
        }
      }
    });
  }


  // ===============================
  // Book a class
  // ===============================
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

  // ===============================
  // Navigation Methods
  // ===============================
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

  // ===============================
  // Logout and clear session
  // ===============================
  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // ===============================
  // Feedback users
  // ===============================

  openGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScEUHsealcBUmCo-xD5mQkHQLjCN7IGqwCRhQuQz_v9n-g-9A/viewform?usp=header');
  }
}
