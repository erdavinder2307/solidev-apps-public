import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AppDetailsComponent } from './app-details/app-details.component';
import { HomeComponent } from './home/home.component';
import { DecideMateProComponent } from './decide-mate-pro/decide-mate-pro.component';
import { SolidCareComponent } from './solid-care/solid-care.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { DeveloperDashboardComponent } from './developer-dashboard/developer-dashboard.component';
import { DeveloperAddAppComponent } from './developer-dashboard/developer-add-app.component';
import { DeveloperAppsListComponent } from './developer-dashboard/developer-apps-list.component';
import { DeveloperDashboardHomeComponent } from './developer-dashboard/developer-dashboard-home.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { DemoComingSoonComponent } from './demo-coming-soon/demo-coming-soon.component';
import { CategoriesComponent } from './categories/categories.component';
import { SearchComponent } from './search/search.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ContactComponent } from './legal/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:categoryId', component: CategoriesComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'solid-care', component: SolidCareComponent },
  { path: 'decide-mate-pro', component: DecideMateProComponent },
  { path: 'app-details/:id', component: AppDetailsComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'dev-login', component: AdminLoginComponent },
  { path: 'coming-soon', component: ComingSoonComponent },
  { path: 'demo-coming-soon', component: DemoComingSoonComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'about',
    loadComponent: () => import('./about-page/about-page.component').then(m => m.AboutPageComponent)
  },
  {
    path: 'developer-dashboard',
    component: DeveloperDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: DeveloperDashboardHomeComponent },
      { path: 'home', component: DeveloperDashboardHomeComponent },
      { path: 'list', component: DeveloperAppsListComponent },
      { path: 'add-app', component: DeveloperAddAppComponent },
    ]
  },
  // Legal pages - lazy loaded
  {
    path: 'legal',
    children: [
      {
        path: 'terms',
        loadComponent: () => import('./legal/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./legal/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'refund',
        loadComponent: () => import('./legal/refund.component').then(m => m.RefundComponent)
      },
      {
        path: 'relocation',
        loadComponent: () => import('./legal/relocation.component').then(m => m.RelocationComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./legal/contact.component').then(m => m.ContactComponent)
      }
    ]
  },
  // 404 page
  {
    path: '404',
    loadComponent: () => import('./error/not-found.component').then(m => m.NotFoundComponent)
  },
  // Wildcard route - must be last
  { path: '**', redirectTo: '/404' }
];
