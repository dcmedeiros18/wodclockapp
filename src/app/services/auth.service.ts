import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  // ============================================
  // LOGIN: Authenticate user and store session
  // ============================================
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        if (response && response.access_token && response.user) {
          // Save JWT and user info to localStorage
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        } else {
          // If login fails, clear session
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      })
    );
  }

  // ==================================================
  // REGISTER: Create a new user with secret question
  // ==================================================
  register(user: any): Observable<any> {
    // Make sure secretQuestion and secretAnswer are included
    return this.http.post(`${this.apiUrl}/register`, {
      ...user,
      secretQuestion: user.secretQuestion,
      secretAnswer: user.secretAnswer,
    });
  }

  // ============================================================
  // SESSION MANAGEMENT: Retrieve current user from localStorage
  // ============================================================
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

  // Get the user's profile/role (admin, coach, athlete, etc.)
  getUserProfile(): string {
    const user = this.getCurrentUser();
    return user?.profile || '';
  }

  // Get the logged-in user's ID
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id ?? null;
  }
}
