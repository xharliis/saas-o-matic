import { Routes } from '@angular/router';

// Definición de las rutas del frontend de Angular
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'customer/new',
    loadComponent: () => import('./pages/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
  },
  {
    path: 'customer/:id/edit',
    loadComponent: () => import('./pages/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
  },
  {
    path: 'simulations/:id',
    loadComponent: () => import('./pages/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
