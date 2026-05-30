import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/showcase/showcase.component').then((m) => m.ShowcaseComponent),
  },
  {
    path: 'ranking',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ranking/ranking.component').then((m) => m.RankingComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
