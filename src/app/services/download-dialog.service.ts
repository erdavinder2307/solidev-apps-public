import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { App } from './app.service';

export interface DownloadDialogConfig {
  app: App;
  show: boolean;
}

export interface DownloadDialogResult {
  action: 'login' | 'guest' | 'cancel';
  agreedToTerms?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadDialogService {
  private dialogConfigSubject = new BehaviorSubject<DownloadDialogConfig | null>(null);
  private dialogResultSubject = new BehaviorSubject<DownloadDialogResult | null>(null);

  public dialogConfig$ = this.dialogConfigSubject.asObservable();
  public dialogResult$ = this.dialogResultSubject.asObservable();

  showDownloadDialog(app: App): Promise<DownloadDialogResult> {
    return new Promise((resolve) => {
      // Show the dialog
      this.dialogConfigSubject.next({
        app,
        show: true
      });

      // Subscribe to result
      const subscription = this.dialogResult$.subscribe((result) => {
        if (result !== null) {
          subscription.unsubscribe();
          this.dialogConfigSubject.next(null);
          this.dialogResultSubject.next(null);
          resolve(result);
        }
      });
    });
  }

  emitResult(result: DownloadDialogResult) {
    this.dialogResultSubject.next(result);
  }

  closeDialog() {
    this.dialogConfigSubject.next(null);
    this.dialogResultSubject.next(null);
  }

  hideDialog() {
    const currentConfig = this.dialogConfigSubject.value;
    if (currentConfig) {
      this.dialogConfigSubject.next({
        ...currentConfig,
        show: false
      });
    }
  }
}
