import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1050;">
      <div *ngFor="let toast of toasts" 
           class="toast show align-items-center border-0"
           [class]="getToastClass(toast)"
           role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <strong>{{ toast.title }}</strong>
            <div>{{ toast.message }}</div>
          </div>
          <button type="button" 
                  class="btn-close me-2 m-auto" 
                  (click)="remove(toast.id)"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-success {
      background-color: #d1edff;
      color: #0c5460;
      border-left: 4px solid #0dcaf0;
    }
    .toast-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    .toast-warning {
      background-color: #fff3cd;
      color: #664d03;
      border-left: 4px solid #ffc107;
    }
    .toast-info {
      background-color: #cff4fc;
      color: #055160;
      border-left: 4px solid #0dcaf0;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  remove(id: string) {
    this.toastService.remove(id);
  }

  getToastClass(toast: Toast): string {
    return `toast-${toast.type}`;
  }
}
