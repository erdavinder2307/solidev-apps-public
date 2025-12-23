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
  selector: 'app-solid-care',
  templateUrl: './solid-care.component.html',
  styleUrl: './solid-care.component.scss'
})
export class SolidCareComponent implements OnInit {
  app: AppDetails = {
    name: 'Coffye Dqiabm',
    publisher: 'Coffye Publisher',
    iconUrl: 'https://picsum.photos/seed/appicon/100',
    rating: 4.3,
    reviewsCount: 123456,
    screenshots: [

      `assets/decidematepro/image5v2.png`,
      `assets/decidematepro/image1v2.png`,
      `assets/decidematepro/image2v2.png`,
      `assets/decidematepro/image3v2.png`,
      `assets/decidematepro/image4v2.png`,
 
    ],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vitae ligula at nulla luctus tincidunt. Sed sit amet leo et ipsum vestibulum interdum. Nulla facilisi. Praesent fermentum, sapien sit amet tristique consectetur, dui augue tristique tellus, vel pharetra justo nisl eu ipsum.',
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
}
