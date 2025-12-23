import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '../firebase.config';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private router: Router) {}

  async login() {
    this.error = '';
    this.loading = true;
    const auth = getAuth(firebaseApp);
    try {
      await signInWithEmailAndPassword(auth, this.email, this.password);
      this.router.navigate(['/developer-dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Login failed';
    }
    this.loading = false;
  }
}
