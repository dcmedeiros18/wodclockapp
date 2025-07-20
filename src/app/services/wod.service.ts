import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interface that represents the Workout of the Day (WOD)
export interface Wod {
  id?: number;
  date: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WodService {
  private apiUrl = `${environment.apiUrl}/api/wods`; // Base endpoint for WODs

  constructor(private http: HttpClient) {}

  // ========================================
  // Utility - Build headers with JWT token
  // ========================================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ========================================
  // GET WOD by date
  // ========================================
  getWod(date: string): Observable<{ title: string; description: string } | null> {
    return this.http.get<Wod>(`${this.apiUrl}?date=${date}`, { headers: this.getHeaders() }).pipe(
      map(wod => ({
        title: wod.title,
        description: wod.description
      })),
      catchError(() => of(null)) // Return null if not found
    );
  }

  // ========================================
  // GET all WODs (for admins or reports)
  // ========================================
  getAllWods(): Observable<Wod[]> {
    return this.http.get<Wod[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(() => of([])) // Return empty list on error
    );
  }

  // ========================================
  // CREATE a new WOD
  // ========================================
  createWod(wod: Wod): Observable<Wod> {
    return this.http.post<Wod>(this.apiUrl, wod, { headers: this.getHeaders() });
  }

  // ========================================
  // UPDATE an existing WOD by date
  // ========================================
  updateWod(date: string, wod: Partial<Wod>): Observable<Wod> {
    return this.http.put<Wod>(`${this.apiUrl}/${date}`, wod, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // DELETE WOD by date
  // ========================================
  deleteWod(date: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}?date=${date}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => true),         // Return true if deletion was successful
      catchError(() => of(false)) // Return false if any error occurred
    );
  }
}
