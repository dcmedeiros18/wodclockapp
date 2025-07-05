import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonDatetime, IonIcon } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { closeOutline, barbellOutline } from 'ionicons/icons';
import { ClassService } from 'src/app/services/class.service';

addIcons({
  'close': closeOutline, 
});

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.page.html',
  styleUrls: ['./cancel.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonDatetime]
})

export class CancelPage implements OnInit {
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();

    /**
     * Date will be enabled if it is not
     * Sunday or Saturday
     */
    return utcDay !== 0 ;
  };


  constructor(private router: Router, private classService: ClassService) {
     
      
  }

  ngOnInit() {
  }

  goToUserMembership() {   
    this.router.navigateByUrl('/user-membership');
  }

  cancelBooking() {
    this.classService.cancelBooking();
  }
}

