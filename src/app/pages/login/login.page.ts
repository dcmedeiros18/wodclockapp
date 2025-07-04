import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonRippleEffect, IonImg, IonTextarea } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonTextarea, IonImg, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonInput, IonInputPasswordToggle, IonButton, IonRippleEffect]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    const email = this.email;
    const password = this.password;
    const isLoggedIn = this.authService.login(email, password);
    if (isLoggedIn) {
      this.router.navigate(['./user-membership']);
    }
  }
  goToRegister() {   
    this.router.navigateByUrl('/register');
  }
  
}
