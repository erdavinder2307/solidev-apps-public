import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { firebaseApp } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private auth = getAuth(firebaseApp);

  constructor() {
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }
}
