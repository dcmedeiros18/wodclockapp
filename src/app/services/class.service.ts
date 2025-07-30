import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ===== Interface for a class slot used in booking screen =====
export interface ClassSlot {
  id: number;
  time: string;
  date?: string;
  spots?: number;
  spotsLeft?: number;
  alreadyBooked?: boolean;
  cancelled?: boolean;
  status?: string;
}

// ===== Interface for a successful booking response =====
export interface BookingResponse {
  message: string;
  booking: {
    id: number;
    userId: number;
    classId: number;
    date: string;
    time: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================================
  // PRIVATE: Add authorization headers to request
  // =========================================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('[ClassService] Token check:', token ? `Token present (${token.substring(0, 20)}...)` : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // =========================================
  // Get list of available classes by date
  // =========================================
  getAvailableClasses(date: string): Observable<ClassSlot[]> {
    console.log('[ClassService] Getting classes for date:', date);
  
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return throwError(() => new Error('Invalid date format. Use YYYY-MM-DD'));
    }
  
    try {
      const headers = this.getAuthHeaders();
      console.log('[ClassService] Making request to:', `${this.apiUrl}/api/classes/date/${date}`);
  
      return this.http
        .get<ClassSlot[]>(`${this.apiUrl}/api/classes/date/${date}`, { headers })
        .pipe(
          catchError((error) => {
            console.error('[ClassService] Error fetching available classes:', error);
  
                        if (error.status === 400) {
              return throwError(() => new Error(error.error?.message || 'Invalid date or incorrect parameters'));
            } else if (error.status === 401) {
              localStorage.removeItem('token');
              return throwError(() => new Error('Invalid or expired token'));
            } else if (error.status === 403) {
              return throwError(() => new Error('Access denied'));
            } else if (error.status === 404) {
              return throwError(() => new Error('No classes found for this date'));
            } else if (error.status === 500) {
              return throwError(() => new Error('Internal server error'));
            }

            return throwError(() => new Error('Error loading available classes'));
          })
        );
    } catch (error) {
      console.error('[ClassService] Error in getAuthHeaders:', error);
      return throwError(() => new Error('Authentication error'));
    }
  }
  

  // =========================================
  // Book a class (requires authentication)
  // =========================================
  bookClass(classId: number): Observable<BookingResponse> {
    const body = { classId: Number(classId) };
    const headers = this.getAuthHeaders();

    return this.http.post<BookingResponse>(`${this.apiUrl}/api/bookings`, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error booking class:', error);
        if (error.status === 400) {
          return throwError(() => new Error(error.error?.message || 'Failed to book class'));
        }
        return throwError(() => new Error('Could not complete booking. Please try again.'));
      })
    );
  }

  // =========================================
  // Get current user's bookings (filtered by token)
  // =========================================
  getUserBookings(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    console.log('Auth Token:', headers.get('Authorization'));

    return this.http.get<any[]>(`${this.apiUrl}/api/bookings/user`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching user bookings:', error);
        return throwError(() => new Error('Failed to load your bookings'));
      })
    );
  }

  // =========================================
  // Get user bookings within a specific period
  // =========================================
  getUserBookingsByPeriod(startDate: string, endDate: string): Observable<any[]> {
    const headers = this.getAuthHeaders();

    return this.http
      .get<any[]>(`${this.apiUrl}/api/bookings/user?start=${startDate}&end=${endDate}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching bookings by period:', error);
          return throwError(() => new Error('Failed to load bookings in this period'));
        })
      );
  }

  // =========================================
  // Cancel a specific user booking by ID
  // =========================================
  cancelBooking(bookingId: number): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.apiUrl}/api/bookings/${bookingId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error canceling booking:', error);
        return throwError(() => new Error('Failed to cancel booking'));
      })
    );
  }

  // =========================================
  // Cancel an entire class by classId (admin/coach only)
  // =========================================
  cancelClass(classId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/api/classes/${classId}/cancel`, {}, { headers });
  }
}
