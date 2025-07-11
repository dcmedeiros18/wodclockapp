import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem, IonList, IonInputPasswordToggle, IonButton, IonRippleEffect } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
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

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController) { }

  ngOnInit() {
  }

  onRegister() {
    const email = this.email;
    const password = this.password;
    const isRegister = this.authService.login(email, password); // ou .register se for cadastro mesmo
  
    if (isRegister) {
      // Exibe algo opcionalmente aqui (ex: Toast ou mensagem)
      console.log('Successfully registered! Redirecting...');
  
      // Aguarda 2 segundos antes de redirecionar
      this.presentToast('Successfully registered! Redirecting...');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }
  }
  
  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
  
  goToLogin() {   
    this.router.navigateByUrl('/login'); // caminho certo
  }
}


