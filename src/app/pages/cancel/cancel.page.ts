import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonDatetime, IonIcon } from '@ionic/angular/standalone';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

addIcons({ 'close': closeOutline });

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.page.html',
  styleUrls: ['./cancel.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonButton, IonContent, CommonModule,
    FormsModule, IonDatetime, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent
  ]
})
export class CancelPage implements OnInit {
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  };

  selectedDate: string = '';
  userBookings: any[] = [];
  message: string = '';
  loading: boolean = false;
  bookingsForDate: any[] = [];

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({'close': closeOutline});
  }

  ngOnInit() {}

  async onDateSelected(event: any) {
    this.selectedDate = event.detail.value?.split('T')[0] || '';
    this.message = '';
    this.bookingsForDate = [];
    if (!this.selectedDate) return;
    this.loading = true;

    try {
      const bookings = await this.classService.getUserBookings().toPromise() || [];
      this.userBookings = bookings;

      // Oculta aulas canceladas
      this.bookingsForDate = bookings
        .filter((b: any) =>
          b.class?.date?.startsWith(this.selectedDate) &&
          b.class?.status !== 'cancelled'
        )
        .sort((a: any, b: any) => {
          const timeA = new Date(`${a.class.date}T${a.class.time}`);
          const timeB = new Date(`${b.class.date}T${b.class.time}`);
          return timeA.getTime() - timeB.getTime();
        });

      if (this.bookingsForDate.length === 0) {
        this.message = 'You have no bookings for the selected date.';
      }
    } catch (err) {
      this.message = 'Erro ao buscar reservas.';
    }

    this.loading = false;
  }

  async cancelBooking(booking: any) {
    const now = new Date();
    const classDateTime = new Date(`${booking.class.date}T${booking.class.time}`);
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / 60000;

    if (diffMinutes < 120) {
      this.presentToast('Bookings can only be cancelled at least 2 hours before the scheduled time.', 'danger');
      return;
    }

    try {
      await this.classService.cancelBooking(booking.id).toPromise();
      localStorage.setItem('bookingUpdated', 'true');
      localStorage.setItem('bookingDate', booking.class.date);
      localStorage.setItem('bookingCancelMessage', `Reserva cancelada para ${booking.class.date} às ${booking.class.time}.`);
      this.presentToast(`Booking cancelled for ${booking.class.date} at ${booking.class.time}.`, 'success');
      this.bookingsForDate = this.bookingsForDate.filter(b => b.id !== booking.id);

      if (this.bookingsForDate.length === 0) {
        this.message = 'You have no bookings for the selected date.';
      }

      window.dispatchEvent(new CustomEvent('classesUpdated', {
        detail: { date: booking.class.date }
      }));
    } catch (err) {
      this.presentToast('Erro ao cancelar reserva.', 'danger');
    }
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
