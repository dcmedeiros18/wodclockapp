import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassService, ClassSlot } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';

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
import { addIcons } from 'ionicons';
import {
  body, clipboardOutline, barbellOutline,
  close, calendarNumber, logOutOutline, person, documentTextOutline, arrowDownOutline, arrowForwardOutline } from 'ionicons/icons';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCheckbox,
    MenuComponent,
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
      addIcons({body,clipboardOutline,barbellOutline,close,calendarNumber,logOutOutline,arrowForwardOutline,documentTextOutline,arrowDownOutline});}

  // ===============================
  // Component Initialization
  // ===============================
  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Refresh class list when triggered externally
    window.addEventListener('classesUpdated', (e: any) => {
      const updatedDate = e?.detail?.date || this.selectedDate;
      if (updatedDate) {
        this.onDateSelected({ detail: { value: updatedDate } });
      }
    });

    if (this.selectedDate) {
      this.onDateSelected({ detail: { value: this.selectedDate } });
    }
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
    window.open('https://forms.gle/SEU_LINK_AQUI', '_blank');
  }
}
