import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        // Só salva se ambos existirem
        if (response && response.access_token && response.user) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        } else {
          // Não salva nada se a resposta não for válida
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

getUserProfile(): string {
  const user = this.getCurrentUser();
  return user?.profile || '';
}

}
