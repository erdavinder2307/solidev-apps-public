import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firebaseApp } from '../firebase.config';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterModule,
    NgOptimizedImage
  ],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoginMode = true;
  hidePassword = true;
  loading = false;
  returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true } : null;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async onLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;
    
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, email, password);
      this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
      // Navigate to return URL or home
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 4000 });
    }
    
    this.loading = false;
  }

  async onSignup() {
    if (this.signupForm.invalid) return;

    this.loading = true;
    const { email, password } = this.signupForm.value;
    
    try {
      const auth = getAuth(firebaseApp);
      await createUserWithEmailAndPassword(auth, email, password);
      this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
      // Navigate to return URL or home
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Signup failed', 'Close', { duration: 4000 });
    }
    
    this.loading = false;
  }

  async signInWithGoogle() {
    this.loading = true;
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      this.snackBar.open('Google login successful!', 'Close', { duration: 3000 });
      // Navigate to return URL or home
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Google login failed', 'Close', { duration: 4000 });
    }
    this.loading = false;
  }

  navigateToTerms(event: Event) {
    event.preventDefault();
    this.router.navigate(['/legal/terms']);
  }

  navigateToPrivacy(event: Event) {
    event.preventDefault();
    this.router.navigate(['/legal/privacy']);
  }

  handleForgotPassword(event: Event) {
    event.preventDefault();
    // For now, show a snackbar with instructions
    // In a real app, you might want to create a forgot password dialog or page
    this.snackBar.open(
      'Please contact support at support@example.com for password reset assistance.',
      'Close',
      { duration: 8000 }
    );
  }
}
