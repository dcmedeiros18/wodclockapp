import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'book',
    loadComponent: () => import('../book/book.page').then(m => m.BookPage)
  },
  {
    path: 'user-membership',
    loadComponent: () => import('../user-membership/user-membership.page').then(m => m.UserMembershipPage)
  },
  {
    path: 'wod',
    loadComponent: () => import('../wod/wod.page').then(m => m.WodPage)
  },
  {
    path: 'frequency',
    loadComponent: () => import('../frequency/frequency.page').then(m => m.FrequencyPage)
  },
  {
    path: 'cancel',
    loadComponent: () => import('../cancel/cancel.page').then(m => m.CancelPage)
  }
]; 