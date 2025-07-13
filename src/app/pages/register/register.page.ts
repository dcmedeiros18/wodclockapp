import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonInputPasswordToggle,
  IonButton,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonButton,
    IonContent,
    CommonModule,
    FormsModule,
    IonInput,
    IonItem,
    IonList,
    IonInputPasswordToggle
  ],
})
export class RegisterPage implements OnInit {
  firstName: string = '';
  surname: string = '';
  dateOfBirth: string = '';
  emergencyContactName: string = '';
  emergencyContactPhone: string = '';
  phoneNumber: string = '';
  email: string = '';
  confirmEmail: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async onRegister() {
    if (
      !this.firstName || !this.surname || !this.dateOfBirth ||
      !this.phoneNumber || !this.emergencyContactName || !this.emergencyContactPhone ||
      !this.email || !this.confirmEmail || !this.password || !this.confirmPassword
    ) {
      await this.presentToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!/^[0-9]+$/.test(this.phoneNumber) || !/^[0-9]+$/.test(this.emergencyContactPhone)) {
      await this.presentToast('Phone numbers must contain only digits.', 'warning');
      return;
    }

    // Validação de email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(this.email)) {
      await this.presentToast('Enter a valid email address.', 'warning');
      return;
    }

    if (this.email !== this.confirmEmail) {
      await this.presentToast('Emails do not match.', 'warning');
      return;
    }

    // Validação de senha forte
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(this.password)) {
      await this.presentToast('Password must have at least 6 characters, 1 uppercase letter, 1 number and 1 special character.', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.presentToast('Passwords do not match.', 'warning');
      return;
    }

    const newUser = {
      firstName: this.firstName,
      surname: this.surname,
      dateOfBirth: this.dateOfBirth,
      emergencyContactName: this.emergencyContactName,
      emergencyContactPhone: this.emergencyContactPhone,
      phoneNumber: this.phoneNumber,
      email: this.email,
      confirmEmail: this.confirmEmail,
      password: this.password,
      confirmPassword: this.confirmPassword,
      profile: 'membership'
    };

    this.authService.register(newUser).subscribe({
      next: async (res) => {
        await this.presentToast('User registered successfully!', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        if (err.error && err.error.message) {
          await this.presentToast(err.error.message, 'danger');
        } else {
          await this.presentToast('Unexpected error. Please try again.', 'danger');
        }
      }
    });
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
