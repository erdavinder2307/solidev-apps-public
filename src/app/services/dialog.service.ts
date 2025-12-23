import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  showCancel?: boolean;
}

export interface DialogResult {
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogConfig = new BehaviorSubject<DialogConfig | null>(null);
  private dialogResult = new BehaviorSubject<DialogResult | null>(null);

  public dialogConfig$ = this.dialogConfig.asObservable();
  public dialogResult$ = this.dialogResult.asObservable();

  showConfirmDialog(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      // Set default values
      const fullConfig: DialogConfig = {
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info',
        ...config
      };

      this.dialogConfig.next(fullConfig);

      // Subscribe to result
      const subscription = this.dialogResult$.subscribe((result) => {
        if (result !== null) {
          subscription.unsubscribe();
          this.dialogConfig.next(null);
          this.dialogResult.next(null);
          resolve(result.confirmed);
        }
      });
    });
  }

  confirmDialog(confirmed: boolean) {
    this.dialogResult.next({ confirmed });
  }

  closeDialog() {
    this.dialogConfig.next(null);
    this.dialogResult.next(null);
  }
}
