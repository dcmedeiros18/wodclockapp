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
  IonIcon, IonButtons } from '@ionic/angular/standalone';
import { ForgotPasswordService } from 'src/app/services/forgot-password.service';
import { addIcons } from 'ionicons';
import { eye, eyeOff, checkmarkCircle } from 'ionicons/icons';
addIcons({
  'eye': eye,
  'eye-off': eyeOff
});

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonButtons, 
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
  // Input variables bound to form fields
  email = '';
  question = '';
  answer = '';
  secretAnswer = '';
  newPassword = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  confirmPassword: string = '';
  resetSuccess = false;


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Control stage of the form: email input, question answer, or password reset
  stage: 'email' | 'question' | 'reset' | undefined = 'email';

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private toastController: ToastController,
    private router: Router
  ) {
      addIcons({checkmarkCircle});}

  /**
   * Step 1: Validate email and retrieve the secret question
   */
  validateEmail() {
    this.forgotPasswordService.getSecretQuestion(this.email).subscribe({
      next: async (res) => {
        console.log('Resposta da API:', res); // deve mostrar { question: '...' }
        this.question = res?.question;
        if (this.question) {
          this.stage = 'question';
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
  
  

  /**
   * Step 2: Verify user's answer to the secret question
   */
  validateAnswer() {
    this.forgotPasswordService.verifySecretAnswer(this.email, this.secretAnswer).subscribe({
      next: (res) => {
        if (res?.valid) {
          this.stage = 'reset'; // <-- avança para redefinir senha
        } else {
          this.presentToast('Incorrect answer.', 'danger');
        }
      },
      error: () => this.presentToast('Error validating answer.', 'danger'),
    });
  }
  
  

  /**
   * Step 3: Send new password to the backend
   */
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
          this.resetSuccess = true;        // <-- ativa mensagem fixa
          this.stage = undefined;          // <-- oculta as etapas anteriores
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: async (err) => {
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
  
  

  /**
   * Utility: Display toast messages
   */
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
    });
    toast.present();
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
  
}
