import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonDatetime, IonButton, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { calendarNumber } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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

  constructor(private router: Router) {
      addIcons({calendarNumber});}

  ngOnInit() {}

  // FUNCTION TO ENABLE ONLY WORKING DAYS
  isWeekday = (dateString: string): boolean => { /* method to block day of the week */
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;  // excludes Sundays
  };

  // FUNCTION TO CALCULATE CLASSES HISTORY
  calculateHistory(): void {
    if (this.startDateValue && this.endDateValue) {
      const start = new Date(this.startDateValue);
      const end = new Date(this.endDateValue);

      let count = 0;
      const highlights: any[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) { // ignore sundays
          count++;
        }

        highlights.push({
          date: d.toISOString().split('T')[0],
          textColor: 'white',
          backgroundColor: 'red',
          borderColor: 'red'
        });
      }

      this.totalClasses = count;
      this.highlightedDates = highlights;
    } else {
      this.totalClasses = null;
      this.highlightedDates = [];
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
