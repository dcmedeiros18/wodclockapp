import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonDatetimeButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline } from 'ionicons/icons';
import { RouterModule, Router } from '@angular/router';

addIcons({
  'barbell-outline': barbellOutline, 
});

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonDatetimeButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonDatetime, IonModal, IonGrid, IonRow, IonCol, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule] 
})
export class WodPage implements OnInit {
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();

    /**
     * Date will be enabled if it is not
     * Sunday or Saturday
     */
    return utcDay !== 0 ;
  };


  constructor(private router: Router) {
      addIcons({barbellOutline});
       }

  ngOnInit() {
  }

  goToUserMembership() {   
    this.router.navigateByUrl('/user-membership'); // caminho certo
  }

}
