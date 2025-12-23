import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogConfig } from '../services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="dialogConfig" (click)="onOverlayClick($event)">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h5 class="dialog-title" [ngClass]="getTitleClass()">
            <i class="me-2" [ngClass]="getIconClass()"></i>
            {{ dialogConfig.title }}
          </h5>
        </div>
        
        <div class="dialog-body">
          <p class="dialog-message">{{ dialogConfig.message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button type="button" 
                  *ngIf="dialogConfig.showCancel !== false"
                  class="btn btn-outline-secondary me-2" 
                  (click)="onCancel()">
            {{ dialogConfig.cancelText }}
          </button>
          <button type="button" 
                  class="btn" 
                  [ngClass]="getConfirmButtonClass()" 
                  (click)="onConfirm()">
            {{ dialogConfig.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    .dialog-container {
      background: white;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.2s ease-out;
    }

    .dialog-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: none;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .dialog-title.text-danger {
      color: #dc3545 !important;
    }

    .dialog-title.text-warning {
      color: #fd7e14 !important;
    }

    .dialog-title.text-success {
      color: #198754 !important;
    }

    .dialog-title.text-info {
      color: #0dcaf0 !important;
    }

    .dialog-body {
      padding: 1rem 1.5rem;
    }

    .dialog-message {
      margin: 0;
      color: #6c757d;
      line-height: 1.5;
    }

    .dialog-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      border: 1px solid;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  dialogConfig: DialogConfig | null = null;
  private subscription: Subscription | null = null;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.subscription = this.dialogService.dialogConfig$.subscribe(config => {
      this.dialogConfig = config;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm() {
    this.dialogService.confirmDialog(true);
  }

  onCancel() {
    this.dialogService.confirmDialog(false);
  }

  onOverlayClick(event: MouseEvent) {
    // Close dialog when clicking on overlay (outside the dialog)
    this.onCancel();
  }

  getTitleClass(): string {
    switch (this.dialogConfig?.type) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
      default:
        return 'text-info';
    }
  }

  getIconClass(): string {
    switch (this.dialogConfig?.type) {
      case 'danger':
        return 'bi bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi bi-exclamation-circle-fill';
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'info':
      default:
        return 'bi bi-info-circle-fill';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.dialogConfig?.type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'success':
        return 'btn-success';
      case 'info':
      default:
        return 'btn-primary';
    }
  }
}
