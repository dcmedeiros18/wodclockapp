import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonDatetime,
  IonIcon,
  IonText,
  ToastController
} from '@ionic/angular/standalone';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  body,
  clipboardOutline,
  barbellOutline,
  calendarNumber,
  logOutOutline
} from 'ionicons/icons';

import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';

// Register required icons
addIcons({
  close: closeOutline,
  body,
  clipboardOutline,
  barbellOutline,
  calendarNumber,
  logOutOutline
});

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.page.html',
  styleUrls: ['./cancel.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonIcon,
    IonButton,
    IonContent,
    CommonModule,
    FormsModule,
    IonDatetime,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class CancelPage implements OnInit {

  // Disable Sundays in the calendar
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  };

  selectedDate: string = '';
  userBookings: any[] = [];
  bookingsForDate: any[] = [];
  message: string = '';
  loading: boolean = false;

  // Rotating motivational phrases
  motivationalPhrases: string[] = [
    '"Hard work pays off." – Mat Fraser',
    '"You can either have excuses or results. Not both." – Tia-Clair Toomey',
    '"Be proud but never satisfied." – Katrin Davidsdottir',
    '"In training, you listen to your body. In competition, you tell your body to shut up." – Rich Froning',
    '"I will not let the pain stop me. I will not quit." – Annie Thorisdottir'
  ];

  currentPhraseIndex: number = 0;

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Rotate motivational phrases every 5 seconds
    setInterval(() => {
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % this.motivationalPhrases.length;
    }, 5000);
  }

  /**
   * Called when the user selects a date from the calendar.
   * Filters bookings for that specific date and checks if the date is past.
   */
  onDateSelected(event: any) {
    const selectedDate = new Date(event.detail.value);
    const today = new Date();
    this.bookingsForDate = [];
    this.message = '';
    this.loading = true;

    this.classService.getUserBookings().subscribe({
      next: (bookings) => {
        const selectedDay = selectedDate.toDateString();

        // If selected date is in the past, show message
        if (selectedDate.getTime() < today.setHours(0, 0, 0, 0)) {
          this.message = 'This class has already happened.';
          this.loading = false;
          return;
        }

        // Filter bookings for the selected day
        const bookingsOnDate = bookings.filter((booking) => {
          const classDate = new Date(`${booking.class.date}T${booking.class.time}`);
          return new Date(booking.class.date).toDateString() === selectedDay;
        });

        if (bookingsOnDate.length > 0) {
          this.bookingsForDate = bookingsOnDate;
        } else {
          this.message = 'No booking found for this day.';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error loading your bookings.';
        this.loading = false;
      }
    });
  }

  /**
   * Cancels a booking if it is at least 2 hours before the class.
   */
  async cancelBooking(booking: any) {
    const now = new Date();
    const classDateTime = new Date(`${booking.class.date}T${booking.class.time}`);
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / 60000;

    if (diffMinutes < 120) {
      this.presentToast(
        'Bookings can only be cancelled at least 2 hours before the scheduled time.',
        'danger'
      );
      return;
    }

    try {
      await this.classService.cancelBooking(booking.id).toPromise();

      // Save confirmation message in local storage for history view
      localStorage.setItem('bookingUpdated', 'true');
      localStorage.setItem('bookingDate', booking.class.date);
      localStorage.setItem(
        'bookingCancelMessage',
        `Booking cancelled for ${booking.class.date} at ${booking.class.time}.`
      );

      this.presentToast(
        `Booking cancelled for ${booking.class.date} at ${booking.class.time}.`,
        'success'
      );

      // Remove the cancelled booking from the list
      this.bookingsForDate = this.bookingsForDate.filter(b => b.id !== booking.id);

      // Show empty state if no more bookings
      if (this.bookingsForDate.length === 0) {
        this.message = 'You have no bookings for the selected date.';
      }

      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('classesUpdated', {
        detail: { date: booking.class.date }
      }));

    } catch (err) {
      this.presentToast('Error cancelling booking.', 'danger');
    }
  }

  /**
   * Displays a toast message at the bottom of the screen.
   */
  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  // ===============================
  // Navigation Methods
  // ===============================

  goToUserMembership() {
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

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
