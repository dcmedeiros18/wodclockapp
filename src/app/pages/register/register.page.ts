import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem, IonList, IonInputPasswordToggle, IonButton, IonRippleEffect } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonRippleEffect, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonInput, IonItem, IonList, IonInputPasswordToggle]
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onRegister() {
    const email = this.email;
    const password = this.password;
    const isRegister = this.authService.login(email, password);
    if (isRegister) {
      // Redirects to the login page after registering
      this.router.navigate(['/pages/login']);
    }
  }
  goToLogin() {   
    this.router.navigateByUrl('/login'); // caminho certo
  }

}


