import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonInput, IonButton]
})
export class ForgotPasswordPage {
  email: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  sendResetLink() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email.';
      this.message = '';
      return;
    }
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Invalid email format.';
      this.message = '';
      return;
    }
    // Simulação do envio de e-mail
    this.message = `Reset link sent to ${this.email}`;
    this.errorMessage = '';
  }

  validateEmail(email: string): boolean {
    // Validação simples de email
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  clearMessages() {
    this.errorMessage = '';
    this.message = '';
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
