# Enhanced Featured Apps Section

## Overview
The Featured Apps section has been enhanced with a screenshots carousel using ngx-owl-carousel-o. Featured apps now display app information on the left and interactive screenshots on the right.

## Features

### Layout
- **Two-column layout** on desktop (app info + screenshots)
- **Stacked layout** on mobile (app info first, screenshots below)
- **Responsive design** that adapts to different screen sizes

### Screenshots Carousel
- **Interactive carousel** with navigation arrows and dots
- **Auto-play** functionality with pause on hover
- **Touch/swipe support** for mobile devices
- **Lazy loading** for improved performance
- **Smooth transitions** and hover effects

### Visual Enhancements
- **Glass morphism effects** with backdrop blur
- **Gradient overlays** for better text readability
- **Rounded corners** and shadows on screenshots
- **Hover animations** and scaling effects

## Technical Implementation

### Dependencies
- **ngx-owl-carousel-o**: ^19.0.0 (already installed)
- **Angular**: ^19.1.7
- **Bootstrap**: ^5.3.3

### Key Components

#### TypeScript (home.component.ts)
```typescript
// Carousel configuration
screenshotsCarouselOptions: OwlOptions = {
  loop: true,
  mouseDrag: true,
  touchDrag: true,
  dots: true,
  nav: true,
  autoplay: true,
  autoplayTimeout: 4000,
  responsive: {
    0: { items: 1, nav: false },
    740: { items: 2, nav: true },
    940: { items: 3, nav: true }
  }
};

// Helper methods
hasScreenshots(app: App): boolean
getValidScreenshots(app: App): string[]
```

#### HTML Template
```html
<div class="featured-content">
  <div class="featured-left">
    <!-- App info (icon, title, description, rating, install button) -->
  </div>
  <div class="featured-right" *ngIf="hasScreenshots(app)">
    <div class="screenshots-section">
      <h4 class="screenshots-caption">Screenshots</h4>
      <owl-carousel-o [options]="screenshotsCarouselOptions">
        <ng-template carouselSlide *ngFor="let screenshot of getValidScreenshots(app)">
          <!-- Screenshot display -->
        </ng-template>
      </owl-carousel-o>
    </div>
  </div>
</div>
```

#### CSS/SCSS Styling
- **Flexbox layout** for responsive design
- **Custom carousel styling** with branded colors
- **Mobile-first approach** with breakpoint-specific styles
- **Accessibility considerations** with focus states

## Data Structure

### Firebase App Document
```json
{
  "name": "App Name",
  "category": "Category",
  "description": "App description...",
  "iconUrl": "https://...",
  "screenshotUrls": [
    "https://screenshot1.jpg",
    "https://screenshot2.jpg",
    "https://screenshot3.jpg"
  ],
  "rating": 4.5,
  "reviewsCount": 1250,
  "isFeatured": true
}
```

## Usage Examples

### Adding Screenshots to Apps
1. Update your app documents in Firestore
2. Add a `screenshotUrls` array with image URLs
3. Screenshots will automatically appear in the carousel
4. If no screenshots exist, the carousel is hidden gracefully

### Customizing Carousel Settings
```typescript
// Modify carousel options in home.component.ts
screenshotsCarouselOptions: OwlOptions = {
  // Customize these settings
  autoplayTimeout: 3000,  // Change autoplay speed
  loop: false,            // Disable looping
  dots: false,            // Hide navigation dots
  nav: true               // Show navigation arrows
};
```

## Responsive Breakpoints

- **Mobile** (0-767px): Single column, carousel shows 1 item
- **Tablet** (768-939px): Stacked layout, carousel shows 2 items
- **Desktop** (940px+): Two-column layout, carousel shows 3 items

## Performance Optimizations

- **Lazy loading** for screenshot images
- **trackBy functions** for efficient rendering
- **Optimized image sizes** (recommended: 400x800px for screenshots)
- **Conditional rendering** (carousel only shows if screenshots exist)

## Browser Support

- **Modern browsers** (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Mobile browsers** (iOS Safari 12+, Chrome Mobile 60+)
- **Touch/gesture support** for mobile devices

## Accessibility Features

- **Alt text** for all images
- **Keyboard navigation** support
- **Focus indicators** for navigation elements
- **Screen reader friendly** markup

## Testing

Run the populate script to add sample data with screenshots:
```bash
cd src/scripts
npx ts-node populate-featured-apps.ts
```

## Future Enhancements

- **Video screenshots** support
- **Zoom functionality** for enlarged image viewing
- **Screenshot comparison** mode
- **User-uploaded** screenshots and reviews
