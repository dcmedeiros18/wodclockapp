import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  AlertController,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
    IonInputPasswordToggle,
    IonSelect,
    IonSelectOption
  ],
})
export class RegisterPage implements OnInit {

  // ===============================
  // Form Fields
  // ===============================
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

  // ===============================
  // Secret Question & Answer
  // ===============================
  secretQuestions: string[] = [
    'What is the name of your first pet?',
    'What is your favorite book?',
    'What city were you born in?',
    'What is your mother’s maiden name?',
    'What was your childhood nickname?',
    'What is your dream travel destination?'
  ];
  selectedQuestion: string = '';
  secretAnswer: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  // ===============================
  // Handles user registration logic
  // ===============================
  async onRegister() {
    // Validate required fields
    if (
      !this.firstName || !this.surname || !this.dateOfBirth ||
      !this.phoneNumber || !this.emergencyContactName || !this.emergencyContactPhone ||
      !this.email || !this.confirmEmail || !this.password || !this.confirmPassword ||
      !this.selectedQuestion || !this.secretAnswer
    ) {
      await this.presentToast('Please fill in all required fields.', 'warning');
      return;
    }

    // Validate numeric phone inputs
    if (!/^[0-9]+$/.test(this.phoneNumber) || !/^[0-9]+$/.test(this.emergencyContactPhone)) {
      await this.presentToast('Phone numbers must contain only digits.', 'warning');
      return;
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(this.email)) {
      await this.presentToast('Enter a valid email address.', 'warning');
      return;
    }

    // Check if email and confirm email match
    if (this.email !== this.confirmEmail) {
      await this.presentToast('Emails do not match.', 'warning');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(this.password)) {
      await this.presentToast(
        'Password must have at least 6 characters, 1 uppercase letter, 1 number and 1 special character.',
        'warning'
      );
      return;
    }

    // Check if password and confirm password match
    if (this.password !== this.confirmPassword) {
      await this.presentToast('Passwords do not match.', 'warning');
      return;
    }

    // Create user object to send to backend
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
      secretQuestion: this.selectedQuestion,
      secretAnswer: this.secretAnswer,
      profile: 'membership' // default user profile
    };

    // Send registration request to backend
    this.authService.register(newUser).subscribe({
      next: async () => {
        await this.presentToast('User registered successfully!', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        if (err.error?.message) {
          await this.presentToast(err.error.message, 'danger');
        } else {
          await this.presentToast('Unexpected error. Please try again.', 'danger');
        }
      }
    });
  }

  // ===============================
  // Displays toast notifications
  // ===============================
  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  // ===============================
  // Navigates to the login page
  // ===============================
  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
