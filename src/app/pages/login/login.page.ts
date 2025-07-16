import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonInputPasswordToggle, IonButton } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonContent, CommonModule, FormsModule, IonInput, IonInputPasswordToggle, IonButton]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Lifecycle hook for initialization
  }

  // Handles login logic using AuthService
  onLogin() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // Check if response contains token and user info
        if (res && res.access_token && res.user) {
          // Navigate to user area on successful login
          this.router.navigate(['./user-membership']);
        } else {
          this.errorMessage = 'Invalid login. Please check your credentials.';
        }
      },
      error: (err) => {
        // Display backend error message or fallback message
        this.errorMessage = (err.error && err.error.message) ? err.error.message : 'Login failed. Please try again.';
      }
    });
  }

  // Redirects to the registration page
  goToRegister() {   
    this.router.navigateByUrl('/register');
  }

  // Toggles visibility of the password field
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Redirects to the forgot password page
  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
