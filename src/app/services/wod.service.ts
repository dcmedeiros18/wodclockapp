import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/api/wods`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Retorna o WOD para a data informada.
   */
  getWod(date: string): Observable<{ title: string, description: string } | null> {
    return this.http.get<Wod>(`${this.apiUrl}?date=${date}`, { headers: this.getHeaders() }).pipe(
      map(wod => ({
        title: wod.title,
        description: wod.description
      })),
      catchError(() => of(null))
    );
  }
  

  /**
   * Retorna todos os WODs
   */
  getAllWods(): Observable<Wod[]> {
    return this.http.get<Wod[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  /**
   * Cria um novo WOD
   */
  createWod(wod: Wod): Observable<Wod> {
    return this.http.post<Wod>(this.apiUrl, wod, { headers: this.getHeaders() });
  }


  /**
   * Atualiza um WOD existente
   */
  updateWod(date: string, wod: Partial<Wod>): Observable<Wod> {
    return this.http.put<Wod>(`${this.apiUrl}/${date}`, wod, {
      headers: this.getHeaders()
    });
  }
  

  /**
   * Remove um WOD
   */
  deleteWod(date: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}?date=${date}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
  
}
