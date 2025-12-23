import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  // Admin email is configured via environment variable
  // Set ADMIN_EMAIL in your .env file
  private readonly ADMIN_EMAIL = process.env['ADMIN_EMAIL'] || '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.ADMIN_EMAIL) {
      console.warn('Admin email not configured. Set ADMIN_EMAIL environment variable.');
    }
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (user && user.email === this.ADMIN_EMAIL) {
          return true;
        } else {
          // Redirect to login with return URL
          this.router.navigate(['/login'], { 
            queryParams: { 
              returnUrl: state.url,
              error: 'admin-required' 
            } 
          });
          return false;
        }
      })
    );
  }
}

