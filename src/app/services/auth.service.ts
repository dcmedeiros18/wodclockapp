import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  
  //login function
  login(email: string, password: string) {
    if (email === 'dc.medeiros@live.com' && password === '123456') {
      return true;
    }
    return false;
  }
}
