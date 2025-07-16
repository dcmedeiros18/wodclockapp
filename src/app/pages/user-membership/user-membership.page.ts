import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbellOutline, calendarNumber, close, clipboardOutline, logOutOutline } from 'ionicons/icons';

// Registering Ionicons for use in the component
addIcons({
  'barbell-outline': barbellOutline,
  'close': close,
  'calendar-number': calendarNumber,
  'clipboard-outline': clipboardOutline,
  'log-out-outline': logOutOutline
});

@Component({
  selector: 'app-user-membership', // Component selector for the HTML tag
  templateUrl: './user-membership.page.html', // HTML template file
  styleUrls: ['./user-membership.page.scss'], // SCSS style file
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonIcon, IonToolbar, RouterModule], // Required Angular and Ionic modules
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserMembershipPage implements OnInit {
  currentUserName: string = ''; // Stores the current user's name for greeting

  // Array of carousel image paths
  carouselImages: string[] = [
    '/assets/images/crossfit_crew.png',
    '/assets/images/woman_and_kettlebell.png',
    '/assets/images/login-page.png'
  ];

  currentCarouselIndex: number = 0; // Tracks the current image index
  carouselInterval: any; // Holds the interval reference

  constructor(private router: Router) {
    // Ensures icons are available even if initialized before the constructor runs
    addIcons({ clipboardOutline, barbellOutline, close, calendarNumber, logOutOutline });
  }

  ngOnInit() {
    // Load user info from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      // Fallback options in case 'name' is missing
      this.currentUserName = parsedUser.name || parsedUser.fullName || 'Athlete';
    }

    // Starts the image carousel auto-rotation
    this.startCarousel();
  }

  // Starts rotating carousel images every 3 seconds
  startCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval); // Clear any existing interval
    }
    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselImages.length;
    }, 3000); // Change image every 3000ms (3s)
  }

  // Clears the interval when the component is destroyed to avoid memory leaks
  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // Optional carousel config (not being used directly unless tied to ion-slides)
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true
  };

  // Navigation methods to different routes
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

  // Logs the user out by clearing storage and redirecting to login page
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('/login');
  }
}
