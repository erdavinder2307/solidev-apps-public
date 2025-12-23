import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { firebaseApp, firebaseAnalytics } from './firebase.config';
import { ToastComponent } from './toast/toast.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog.component';
import { DownloadDialogComponent } from './shared/download-dialog.component';
import { InstallPromptComponent } from './components/install-prompt/install-prompt.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule, ToastComponent, ConfirmationDialogComponent, DownloadDialogComponent, InstallPromptComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

}
