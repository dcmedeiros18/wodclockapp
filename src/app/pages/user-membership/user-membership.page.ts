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
  logOutOutline, arrowForwardOutline, documentTextOutline, body } from 'ionicons/icons';

// ====================================
// Register Ionicons globally
// ====================================
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
  // Holds current user's name to display in welcome message
  currentUserName: string = '';

  // Array of images used in the community photo carousel
  carouselImages: string[] = [
    '/assets/images/crossfit_crew.png',
    '/assets/images/temp-bar.jpg', 
    '/assets/images/woman_and_kettlebell.png',
    '/assets/images/temp-StrengthinMotion.png',
    '/assets/images/temp-dumbleUnder.jpg',
    '/assets/images/temp-FitnessFocusinUrbanGym.png',
    '/assets/images/temp-IntenseCrossFitCompetitioninAction.png'
  ];

  // Index of the currently displayed image in the carousel
  currentCarouselIndex: number = 0;

  // Interval reference for the carousel auto-rotation
  carouselInterval: any;

  constructor(private router: Router) {
    // Register icons again to ensure availability
    addIcons({logOutOutline,clipboardOutline,barbellOutline,close,calendarNumber,arrowForwardOutline,documentTextOutline,body});
  }

  // ====================================
  // Lifecycle Hook - OnInit
  // ====================================
  ngOnInit() {
    // Load the current user's name from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      const firstName = user.firstName || '';
      const surname = user.surname || '';
      this.currentUserName = `${firstName} ${surname}`.trim();
    } else {
      this.currentUserName = 'Athlete';
    }

    // Start rotating carousel images
    this.startCarousel();
  }

  // Starts the automatic image carousel rotation
  startCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval); // Clear any existing interval
    }

    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex =
        (this.currentCarouselIndex + 1) % this.carouselImages.length;
    }, 3000); // Rotate every 3 seconds
  }

  // ====================================
  // Lifecycle Hook - OnDestroy
  // ====================================
  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval); // Prevent memory leaks
    }
  }

  // Optional settings for carousel (for future enhancement)
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true
  };

  // ====================================
  // Navigation methods
  // ====================================
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

  // Logs the user out and redirects to login page
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('/login');
  }

  // ===============================
  // Feedback users
  // ===============================
  openGoogleForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScEUHsealcBUmCo-xD5mQkHQLjCN7IGqwCRhQuQz_v9n-g-9A/viewform?usp=header');
  }
}
