import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonDatetime, IonIcon } from '@ionic/angular/standalone';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { closeOutline, barbellOutline } from 'ionicons/icons';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController, AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

addIcons({
  'close': closeOutline, 
});

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.page.html',
  styleUrls: ['./cancel.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonContent, CommonModule, FormsModule, IonDatetime, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CancelPage implements OnInit {
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();

    /**
     * Date will be enabled if it is not
     * Sunday or Saturday
     */
    return utcDay !== 0 ;
  };

  selectedDate: string = '';
  userBookings: any[] = [];
  bookingForDate: any = null;
  message: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
      addIcons({closeOutline});}

  ngOnInit() {}

  async onDateSelected(event: any) {
    this.selectedDate = event.detail.value?.split('T')[0] || '';
    this.bookingForDate = null;
    this.message = '';
    if (!this.selectedDate) return;
    this.loading = true;
    try {
      const bookings = await this.classService.getUserBookings().toPromise() || [];
      console.log('BOOKINGS RECEBIDAS:', bookings); 
      this.userBookings = bookings;
      // Procurar reserva para a data selecionada
      this.bookingForDate = bookings.find((b: any) => b.class?.date?.startsWith(this.selectedDate));
      if (!this.bookingForDate) {
        this.message = 'You have no bookings for the selected date.';
      }
    } catch (err) {
      this.message = 'Erro ao buscar reservas.';
    }
    this.loading = false;
  }

  async cancelBooking() {
    if (!this.bookingForDate) {
      this.presentToast('You have no bookings for the selected date.', 'warning');
      return;
    }
    // Verificar diferença de tempo
    const now = new Date();
    const classDateTime = new Date(`${this.bookingForDate.date}T${this.bookingForDate.time}`);
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 120) {
      this.presentToast('Bookings can only be cancelled at least 2 hours before the scheduled time.', 'danger');
      return;
    }
    try {
      await this.classService.cancelBooking(this.bookingForDate.id).toPromise();
      this.presentToast(`Booking successfully cancelled for ${this.selectedDate} at ${this.bookingForDate.time}.`, 'success');
      this.bookingForDate = null;
      this.message = 'You have no bookings for the selected date.';
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