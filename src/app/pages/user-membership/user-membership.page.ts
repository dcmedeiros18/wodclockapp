import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonIcon, IonLabel} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';



@Component({
  selector: 'app-user-membership',
  templateUrl: './user-membership.page.html',
  styleUrls: ['./user-membership.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButton, IonIcon, IonLabel, RouterModule]
})
export class UserMembershipPage implements OnInit {

  constructor(private router: Router) { 
  }

  ngOnInit() {
  }

  goToBook() {   
    this.router.navigateByUrl('/book'); // caminho certo
  }
  
  goToWod() {
    this.router.navigateByUrl('/wod'); // caminho certo
  }

  

}
