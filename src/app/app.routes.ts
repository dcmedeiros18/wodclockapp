import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'book',
    loadComponent: () => import('./pages/book/book.page').then( m => m.BookPage)
  },
  {
    path: 'user-membership',
    loadComponent: () => import('./pages/user-membership/user-membership.page').then( m => m.UserMembershipPage)
  },
  {
    path: 'wod',
    loadComponent: () => import('./pages/wod/wod.page').then( m => m.WodPage)
  },
  {
    path: 'frequency',
    loadComponent: () => import('./pages/frequency/frequency.page').then( m => m.FrequencyPage)
  },
  {
    path: 'cancel',
    loadComponent: () => import('./pages/cancel/cancel.page').then( m => m.CancelPage)
  },
];
