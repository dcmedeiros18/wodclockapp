import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private apiUrl = environment.authUrl; // Base URL for auth-related endpoints

  constructor(private http: HttpClient) {}

  // ============================================
  // Step 1 - Validate Email: Get secret question
  // ============================================
  getSecretQuestion(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password/validate-email`, { email });
  }

  // ======================================================
  // Step 2 - Validate Answer: Check if answer is correct
  // ======================================================
  verifySecretAnswer(email: string, answer: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password/validate-answer`, {
      email,
      secretAnswer: answer
    });
  }

  // ======================================================
  // Step 3 - Reset Password: Update user's password
  // ======================================================
  resetPasswordWithSecret(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password/update-password`, {
      email,
      newPassword
    });
  }
}
