import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonDatetime,
  IonIcon,
  IonText,
  ToastController, IonFabButton, IonTabs, IonTabButton, IonHeader, IonToolbar, IonTabBar, IonLabel } from '@ionic/angular/standalone';
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
  logOutOutline, arrowForwardOutline, documentTextOutline } from 'ionicons/icons';

import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { MenuComponent } from '../menu/menu.component';

// Register all necessary icons globally
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
    IonHeader,
    IonToolbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonTabButton, IonTabs, IonFabButton, 
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
    IonCardContent,
    MenuComponent,
  ]
})
export class CancelPage implements OnInit {

  // ========== Calendar Control ==========

  // Disable Sundays on the calendar selection
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0; // 0 = Sunday
  };

  // ========== State Variables ==========

  selectedDate: string = '';
  userBookings: any[] = [];
  bookingsForDate: any[] = [];
  message: string = '';
  loading: boolean = false;

  // ========== Motivational Phrase Rotation ==========

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
  ) {
      addIcons({logOutOutline,arrowForwardOutline,documentTextOutline,body,clipboardOutline,barbellOutline,calendarNumber});}

  // ========== Lifecycle Hook ==========

  ngOnInit() {
    // Automatically rotate motivational phrases every 5 seconds
    setInterval(() => {
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % this.motivationalPhrases.length;
    }, 5000);
  }

  // ========== Handle Date Selection ==========

  /**
   * Called when a date is selected from the calendar.
   * Fetches the user's bookings and filters them by selected date.
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

        // If selected date is in the past, do not allow cancellation
        if (selectedDate.getTime() < today.setHours(0, 0, 0, 0)) {
          this.message = 'This class has already happened.';
          this.loading = false;
          return;
        }

        // Filter bookings to match selected date
        const bookingsOnDate = bookings.filter((booking) => {
          const classDate = new Date(`${booking.class.date}T${booking.class.time}`);
          return new Date(booking.class.date).toDateString() === selectedDay;
        });

        // Display bookings or message
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

  // ========== Cancel Booking ==========

  /**
   * Cancels a booking if it is at least 2 hours in advance.
   */
  async cancelBooking(booking: any) {
    const now = new Date();
    const classDateTime = new Date(`${booking.class.date}T${booking.class.time}`);
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / 60000;

    // Cancellation time constraint check
    if (diffMinutes < 120) {
      this.presentToast(
        'Bookings can only be cancelled at least 2 hours before the scheduled time.',
        'danger'
      );
      return;
    }

    try {
      await this.classService.cancelBooking(booking.id).toPromise();

      // Save state to localStorage to inform other pages
      localStorage.setItem('bookingUpdated', 'true');
      localStorage.setItem('bookingDate', booking.class.date);
      localStorage.setItem(
        'bookingCancelMessage',
        `Booking cancelled for ${booking.class.date} at ${booking.class.time}.`
      );

      // Show success toast
      this.presentToast(
        `Booking cancelled for ${booking.class.date} at ${booking.class.time}.`,
        'success'
      );

      // Remove from current list
      this.bookingsForDate = this.bookingsForDate.filter(b => b.id !== booking.id);

      if (this.bookingsForDate.length === 0) {
        this.message = 'You have no bookings for the selected date.';
      }

      // Notify other pages to update the class list
      window.dispatchEvent(new CustomEvent('classesUpdated', {
        detail: { date: booking.class.date }
      }));

    } catch (err) {
      this.presentToast('Error cancelling booking.', 'danger');
    }
  }

  /**
   * Displays a temporary toast message at the bottom.
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

  // ========== Navigation Methods ==========

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

  // ===============================
  // Feedback users
  // ===============================
  openGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScEUHsealcBUmCo-xD5mQkHQLjCN7IGqwCRhQuQz_v9n-g-9A/viewform?usp=header');
  }
}
