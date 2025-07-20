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

  // ===== Login com token =====
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        console.log('Resposta do login:', response);
        if (response && response.access_token && response.user) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      })
    );
  }

  // ===== Registro com pergunta secreta =====
  register(user: any): Observable<any> {
    // Certifique-se que os campos estão sendo enviados
    return this.http.post(`${this.apiUrl}/register`, {
      ...user,
      secretQuestion: user.secretQuestion,
      secretAnswer: user.secretAnswer
    });
  }

  // ===== Recuperar usuário atual do localStorage =====
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

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id ?? null;
  }  

  }
