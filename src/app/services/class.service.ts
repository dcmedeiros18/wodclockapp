import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private mockBookings: { [date: string]: { time: string, spots: number }[] } = {
    '2025-07-04': [
      { time: '06:00 am', spots: 5 },
      { time: '07:00 am', spots: 6 },
      { time: '04:30 pm', spots: 6 }
    ],
    '2025-07-05': [
      { time: '07:00 am', spots: 4 },
      { time: '05:00 pm', spots: 2 }
    ]
  };

  constructor() { }

  getAvailableClasses(date: string): Observable<{ time: string, spots: number }[]> {
    const classes = this.mockBookings[date] || [];
    return of(classes);
  }

  cancelBooking() {
    console.log('Booking cancelled');
  }
}
