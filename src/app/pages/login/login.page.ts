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


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // Só redireciona se houver token e user
        if (res && res.access_token && res.user) {
          this.router.navigate(['./user-membership']);
        } else {
          this.errorMessage = 'Login inválido. Verifique suas credenciais.';
        }
      },
      error: (err) => {
        this.errorMessage = (err.error && err.error.message) ? err.error.message : 'Erro ao fazer login. Tente novamente.';
      }
    });
  }
  goToRegister() {   
    this.router.navigateByUrl('/register');
  }
  
}
