import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then(m => m.LoginPageComponent),
    title: 'Вход',
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'forklifts',
        loadComponent: () => import('./features/forklifts/forklifts-page.component').then(m => m.ForkliftsPageComponent),
        title: 'Справочник погрузчиков',
      },
      {
        path: '',
        redirectTo: '/forklifts',
        pathMatch: 'full',
      },
    ],
  },
];