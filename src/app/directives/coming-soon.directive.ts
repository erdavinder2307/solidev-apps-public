import { Directive, Input, HostListener } from '@angular/core';
import { ComingSoonService } from '../services/coming-soon.service';

@Directive({
  selector: '[appComingSoon]',
  standalone: true
})
export class ComingSoonDirective {
  @Input('appComingSoon') featureType: string = 'feature';
  @Input() featureName?: string;

  constructor(private comingSoonService: ComingSoonService) {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.featureName) {
      this.comingSoonService.navigateToComingSoon(this.featureType, this.featureName);
    } else {
      this.comingSoonService.navigateToComingSoon(this.featureType);
    }
  }
}
