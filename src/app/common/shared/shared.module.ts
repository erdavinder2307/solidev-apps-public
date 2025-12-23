import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterModule, 
    MatCardModule, 
    MatToolbarModule, 
    MatFormFieldModule, 
    CommonModule, 
    MatInputModule,
    MatIconModule,
    MatIcon
  ],
  exports: [RouterOutlet, 
    RouterModule, 
    MatCardModule, 
    MatToolbarModule, 
    MatFormFieldModule, 
    CommonModule, 
    MatInputModule,
    MatIconModule,MatIcon]
})
export class SharedModule { }
