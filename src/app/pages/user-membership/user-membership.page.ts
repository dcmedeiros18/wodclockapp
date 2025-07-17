import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barbellOutline,
  calendarNumber,
  close,
  clipboardOutline,
  logOutOutline
} from 'ionicons/icons';

// Register Ionicons globally for use in templates
addIcons({
  'barbell-outline': barbellOutline,
  'close': close,
  'calendar-number': calendarNumber,
  'clipboard-outline': clipboardOutline,
  'log-out-outline': logOutOutline
});

@Component({
  selector: 'app-user-membership',
  templateUrl: './user-membership.page.html',
  styleUrls: ['./user-membership.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonIcon,
    IonToolbar,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserMembershipPage implements OnInit, OnDestroy {
  currentUserName: string = ''; // Holds current user's name for welcome message

  // Image carousel sources (local assets)
  carouselImages: string[] = [
    '/assets/images/crossfit_crew.png',
    '/assets/images/woman_and_kettlebell.png',
    '/assets/images/login-page.png'
  ];

  currentCarouselIndex: number = 0; // Current image being shown
  carouselInterval: any; // Reference to the interval for clearing on destroy

  constructor(private router: Router) {
    // Register icons again in constructor to ensure availability
    addIcons({
      clipboardOutline,
      barbellOutline,
      close,
      calendarNumber,
      logOutOutline
    });
  }

  ngOnInit() {
    // Get current user from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.currentUserName = parsedUser.name || parsedUser.fullName || 'Athlete';
    }

    // Start the image carousel rotation
    this.startCarousel();
  }

  // Starts carousel auto-rotation every 3 seconds
  startCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval); // Prevent multiple intervals
    }

    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex =
        (this.currentCarouselIndex + 1) % this.carouselImages.length;
    }, 3000);
  }

  // Clear the interval to prevent memory leaks
  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // Carousel options (for future integration with ion-slides if needed)
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true
  };

  // ========= Navigation methods =========
  goToBook() {
    this.router.navigateByUrl('/book');
  }

  goToWod() {
    this.router.navigateByUrl('/wod');
  }

  goToCancel() {
    this.router.navigateByUrl('/cancel');
  }

  goToFrequency() {
    this.router.navigateByUrl('/frequency');
  }

  // Logs out the user and redirects to login page
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('/login');
  }
}
