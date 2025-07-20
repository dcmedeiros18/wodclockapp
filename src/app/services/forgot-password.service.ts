import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private apiUrl = environment.authUrl; // Usa a URL de autenticação

  constructor(private http: HttpClient) {}

   // ======= FORGOT PASSWORD: buscar pergunta secreta =======
   getSecretQuestion(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password/validate-email`, { email });
  }
  

  // ======= FORGOT PASSWORD: validar resposta =======
  verifySecretAnswer(email: string, answer: string): Observable<any> {    
      return this.http.post(`${this.apiUrl}/validate-answer`, {
        email,
        secretAnswer: answer, // <- usa o nome correto do campo que o backend espera
      });
    }
  

  // ======= FORGOT PASSWORD: atualizar senha =======
  resetPasswordWithSecret(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forgot-password/update-password`, {
      email,
      newPassword
    });
  }  
}
