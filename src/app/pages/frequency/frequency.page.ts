import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonDatetime, IonButton, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { calendarNumber } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service';

// ADD ICONS
addIcons({
  'calendar-number': calendarNumber
});

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.page.html',
  styleUrls: ['./frequency.page.scss'],
  standalone: true,
  imports: [ IonModal, IonDatetimeButton, IonButton, IonDatetime, IonIcon, IonContent, 
    CommonModule, FormsModule]
})
export class FrequencyPage implements OnInit {

  // PROPERTIES
  startDateValue: string | null = null;
  endDateValue: string | null = null;
  totalClasses: number | null = null;
  highlightedDates: any[] = [];
  showCalendar = false;
  errorMessage: string | null = null;

  constructor(private router: Router, private classService: ClassService, private authService: AuthService) {
      addIcons({calendarNumber});}

  ngOnInit() {}

  // FUNCTION TO ENABLE ONLY WORKING DAYS
  isWeekday = (dateString: string): boolean => { /* method to block day of the week */
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;  // excludes Sundays
  };

  onDateChange() {
    this.errorMessage = null;
    if (!this.startDateValue || !this.endDateValue) {
      this.errorMessage = 'Select both start and end dates.';
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(this.startDateValue);
    start.setHours(0,0,0,0);
    const end = new Date(this.endDateValue);
    end.setHours(0,0,0,0);
    if (end > today) {
      this.errorMessage = 'End date cannot be greater than today.';
      return;
    }
    if (start > end) {
      this.errorMessage = 'Start date cannot be greater than end date.';
      return;
    }
  }

  // FUNCTION TO CALCULATE CLASSES HISTORY
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
      // Considera apenas reservas ativas
      const activeBookings = bookings.filter((b: any) => b.status !== 'cancelled');
      this.totalClasses = activeBookings.length;
      // Destaca todas as datas entre início e fim
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

  // ROUTE TO THE USER SCREEN
  goToUserMembership(): void {
    this.router.navigateByUrl('/user-membership');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

}
