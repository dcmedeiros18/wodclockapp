import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonIcon, IonLabel} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline, calendar, calendarNumber, calendarOutline, close, homeOutline } from 'ionicons/icons';


addIcons({
  'barbell-outline': barbellOutline,
  'close': close, 
  'calendar': calendar,
  'calendar-number': calendarNumber
});

@Component({
  selector: 'app-user-membership',
  templateUrl: './user-membership.page.html',
  styleUrls: ['./user-membership.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButton, IonIcon, IonLabel, RouterModule]
})
export class UserMembershipPage implements OnInit {
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
  }

  ngOnInit() {
  }

  goToBook() {   
    this.router.navigateByUrl('/book'); // caminho certo
  }
  
  goToWod() {
    this.router.navigateByUrl('/wod'); // caminho certo
  }

  goToCancel() {
    this.router.navigateByUrl('/cancel'); // caminho certo
  }

  goToFrequency() {
    this.router.navigateByUrl('/frequency'); // caminho certo
  }


  

}
