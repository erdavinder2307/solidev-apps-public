import { Pipe, PipeTransform } from '@angular/core';

export interface App {
  id?: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  icon: string;
  screenshots: string[];
  version: string;
  size: string;
  rating: number;
  reviews: number;
  downloads: number;
  price: number;
  featured: boolean;
  tags: string[];
  releaseDate: any;
  lastUpdated: any;
  requirements: string[];
  languages: string[];
  ageRating: string;
  permissions: string[];
}

@Pipe({
  name: 'appSearch',
  standalone: true
})
export class AppSearchPipe implements PipeTransform {

  transform(apps: App[], searchTerm: string, category?: string): App[] {
    if (!apps) {
      return [];
    }

    let filteredApps = apps;

    // Filter by category if provided
    if (category && category !== 'all') {
      filteredApps = filteredApps.filter(app => 
        app.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search term if provided
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredApps = filteredApps.filter(app =>
        app.name.toLowerCase().includes(term) ||
        app.developer.toLowerCase().includes(term) ||
        app.description.toLowerCase().includes(term) ||
        app.category.toLowerCase().includes(term) ||
        (app.tags && app.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    return filteredApps;
  }
}
