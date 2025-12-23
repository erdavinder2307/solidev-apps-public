import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

interface AppDetails {
  name: string;
  publisher: string;
  iconUrl: string;
  rating: number;
  reviewsCount: number;
  screenshots: string[];
  description: string;
  whatsNew: string;
  version: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, CarouselModule, HeaderComponent, FooterComponent, NgbCarouselModule, NgOptimizedImage],
  selector: 'app-decide-mate-pro',
  templateUrl: './decide-mate-pro.component.html',
  styleUrl: './decide-mate-pro.component.scss'
})
export class DecideMateProComponent implements OnInit {
  app: AppDetails = {
    name: 'Decide Mate Pro',
    publisher: 'Soldiev Electrosoft (OPC) Pvt. Ltd.',
    iconUrl: 'assets/decidematepro/decidemate.png',
    rating: 5.0,
    reviewsCount: 123456,
    screenshots: [
      `assets/decidematepro/image1v2.png`,
      `assets/decidematepro/image2v2.png`,
      `assets/decidematepro/image3v2.png`,
      `assets/decidematepro/image4v2.png`,
      `assets/decidematepro/image5v2.png`,
 
    ],
description: `Decide smarter, faster! Explore Quick Spin, Insights, and History—your ultimate decision-making assistant. Download now!

Take the Guesswork Out of Your Day with Decidemate Pro!

Feeling overwhelmed by choices? Whether it’s deciding which watch to wear, what movie to watch, or even what to eat, Decidemate Pro makes decision-making effortless, fun, and stress-free!

With a sleek, customizable decision spinner, you can turn any dilemma into an easy and exciting choice. Say goodbye to indecision and hello to clarity with just one spin.

Key Features:

- Customizable Spinners: Personalize your decision wheel with your own choices. Add as many options as you need!
- Versatile Usage: Perfect for picking outfits, meals, entertainment, or any situation where you need a quick decision.

Why Decidemate Pro?

We all face countless decisions every day. Instead of wasting time deliberating, let Decidemate Pro streamline your choices. It’s like having a personal decision-making assistant in your pocket!

Who Is This App For?

- Busy Professionals: Quickly decide between tasks, outfits, or meals.
- Families & Friends: Use it for group activities, games, or shared decisions.
- The Indecisive: If you struggle to pick, let Decidemate Pro do the hard work for you!

Make Decisions Effortless – Download Decidemate Pro Today!

Simplify your life, add a little fun to your routine, and never get stuck in indecision again.`,
    whatsNew:
      'Bug fixes and performance improvements. Enhanced user interface and navigation.',
    version: '2.3.4'
  };

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }

  constructor() {}

  ngOnInit(): void {}

  downloadApp(): void {
    const link = document.createElement('a');
    link.href = 'assets/decidematepro/app-release.apk';
    link.download = 'app-release.apk';
    link.click();
  }
}
