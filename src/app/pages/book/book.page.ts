import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassService, ClassSlot } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services/auth.service'; // ADICIONADO
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonDatetime,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonDatetime,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class BookPage implements OnInit {
  selectedDate: string = '';
  timeSlots: ClassSlot[] = [];
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private classService: ClassService,
    private authService: AuthService // INJETADO
  ) {}

  ngOnInit() {
    // Verificar se o usuário está logado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigateByUrl('/login');
      return;
    }
  }

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0;
  };

  onDateSelected(event: any): void {
    const isoDate = event.detail.value;
    // Extrai apenas a parte da data (YYYY-MM-DD)
    const datePart = isoDate && isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
    this.selectedDate = datePart;
    this.errorMessage = '';
  
    // Verificar se o usuário ainda está logado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not authenticated. Please log in again.';
      this.router.navigateByUrl('/login');
      return;
    }
  
    this.classService.getAvailableClasses(this.selectedDate).subscribe({
      next: (slots) => {
        this.timeSlots = slots;
      },
      error: (error) => {
        console.error('Erro detalhado:', error);
        this.errorMessage = error.message;
        this.timeSlots = [];
        
        // Se for erro de autenticação, redirecionar para login
        if (error.status === 401 || error.status === 403) {
          this.router.navigateByUrl('/login');
        }
      }
    });
  }
  
  bookClass(classId: number) {
    if (!classId || isNaN(classId)) {
      this.errorMessage = 'Invalid class ID!';
      return;
    }
    console.log('Trying to book class for classId:', classId);
  
    this.classService.bookClass(classId).subscribe({
      next: (res) => {
        this.successMessage = 'Class booked successfully!';
        this.errorMessage = '';
        console.log('Successfully booked:', res);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error booking class.';
        this.successMessage = '';
        console.error('Error booking class:', err);
      }
    });
  }
  
  

  goToWod() {
    this.router.navigateByUrl('/wod');
  }

  goToUserMembership() {
    this.router.navigateByUrl('/user-membership');
  }
}
