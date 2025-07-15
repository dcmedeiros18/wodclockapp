import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ClassSlot {
  id: number;
  time: string;
  spots?: number;
  spotsLeft?: number;
  alreadyBooked?: boolean;
  cancelled?: boolean;
  status?: string;
}

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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAvailableClasses(date: string): Observable<ClassSlot[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ClassSlot[]>(`${this.apiUrl}/api/classes/by-date?date=${date}`, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar classes:', error);
        if (error.status === 400) {
          return throwError(() => new Error(error.error?.message || 'Formato de data inválido'));
        } else if (error.status === 401) {
          return throwError(() => new Error('Token de autenticação inválido ou expirado'));
        } else if (error.status === 403) {
          return throwError(() => new Error('Acesso negado'));
        } else if (error.status === 404) {
          return throwError(() => new Error('Nenhuma classe encontrada para esta data'));
        } else if (error.status === 500) {
          return throwError(() => new Error('Erro interno do servidor'));
        }
        return throwError(() => new Error('Erro ao carregar classes disponíveis'));
      })
    );
  }

  bookClass(classId: number): Observable<BookingResponse> {
    const body = { classId: Number(classId) };
    const headers = this.getAuthHeaders();

    return this.http.post<BookingResponse>(`${this.apiUrl}/api/bookings`, body, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao agendar aula:', error);
        if (error.status === 400) {
          return throwError(() => new Error(error.error?.message || 'Erro ao agendar aula'));
        }
        return throwError(() => new Error('Erro ao agendar aula. Tente novamente.'));
      })
    );
  }

  getUserBookings(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    console.log('TOKEN NOS HEADERS:', headers.get('Authorization'));
    return this.http.get<any[]>(`${this.apiUrl}/api/bookings/user`, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar agendamentos:', error);
        return throwError(() => new Error('Erro ao carregar seus agendamentos'));
      })
    );
  }

  cancelBooking(bookingId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/api/bookings/${bookingId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao cancelar agendamento:', error);
        return throwError(() => new Error('Erro ao cancelar agendamento'));
      })
    );
  }

  cancelClass(classId: number) {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/api/classes/${classId}/cancel`, {}, { headers });
  }

 
}
