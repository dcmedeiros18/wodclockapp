import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonInputPasswordToggle,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';

import { ForgotPasswordService } from 'src/app/services/forgot-password.service';

// Icons for password visibility toggle and success
import { addIcons } from 'ionicons';
import { eye, eyeOff, checkmarkCircle } from 'ionicons/icons';
addIcons({ eye, eyeOff, checkmarkCircle });

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class ForgotPasswordPage {
  // ===============================
  // Form Variables
  // ===============================
  email: string = '';
  question: string = '';
  secretAnswer: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  resetSuccess: boolean = false;

  // Controls visibility of password inputs
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Tracks current step in password recovery process
  stage: 'email' | 'question' | 'reset' | undefined = 'email';

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private toastController: ToastController,
    private router: Router
  ) {}

  // ===============================
  // Toggles visibility of new password input
  // ===============================
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // ===============================
  // Toggles visibility of confirm password input
  // ===============================
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ===============================
  // Step 1: Validates email and retrieves secret question
  // ===============================
  validateEmail() {
    this.forgotPasswordService.getSecretQuestion(this.email).subscribe({
      next: async (res) => {
        this.question = res?.question;
        if (this.question) {
          this.stage = 'question'; // Proceed to secret question stage
        } else {
          await this.presentToast('No secret question found.', 'danger');
        }
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Email not found.';
        await this.presentToast(msg, 'danger');
      }
    });
  }

  // ===============================
  // Step 2: Validates the answer to the secret question
  // ===============================
  validateAnswer() {
    this.forgotPasswordService.verifySecretAnswer(this.email, this.secretAnswer).subscribe({
      next: (res) => {
        if (res?.valid) {
          this.stage = 'reset'; // Proceed to password reset step
        } else {
          this.presentToast('Incorrect answer.', 'danger');
        }
      },
      error: () => this.presentToast('Error validating answer.', 'danger'),
    });
  }

  // ===============================
  // Step 3: Resets the user's password
  // ===============================
  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.presentToast('Please fill in both password fields.', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Passwords do not match.', 'danger');
      return;
    }

    this.forgotPasswordService
      .resetPasswordWithSecret(this.email, this.newPassword)
      .subscribe({
        next: async () => {
          // Show success message and clear previous form state
          this.resetSuccess = true;
          this.stage = undefined;
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: async (err) => {
          // Handles validation errors returned as array or single message
          if (Array.isArray(err.error?.message)) {
            for (const msg of err.error.message) {
              await this.presentToast(msg, 'danger');
            }
          } else {
            await this.presentToast(err.error?.message || 'Error resetting password.', 'danger');
          }
        }
      });
  }

  // ===============================
  // Displays toast notifications
  // ===============================
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
    });
    toast.present();
  }

  // ===============================
  // Navigates back to login page
  // ===============================
  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
