import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonInputPasswordToggle,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonContent,
    CommonModule,
    FormsModule,
    IonInput,
    IonInputPasswordToggle,
    IonButton
  ]
})
export class LoginPage implements OnInit {

  // Form fields
  email: string = '';
  password: string = '';

  // Error message to be displayed if login fails
  errorMessage: string = '';

  // Controls visibility of password input
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  // ===============================
  // Handles login logic using AuthService
  // ===============================
  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // Check if response contains token and user information
        if (res && res.access_token && res.user) {
          // Redirect to user dashboard after successful login
          this.router.navigate(['./user-membership']);
        } else {
          // Show invalid login message
          this.errorMessage = 'Invalid login. Please check your credentials.';
        }
      },
      error: (err) => {
        // Display backend error message if available
        this.errorMessage = (err.error && err.error.message)
          ? err.error.message
          : 'Login failed. Please try again.';
      }
    });
  }

  // ===============================
  // Navigates to the registration page
  // ===============================
  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  // ===============================
  // Navigates to the forgot password page
  // ===============================
  goToForgot(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  // ===============================
  // Toggles the visibility of the password field
  // ===============================
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
