import { Routes } from '@angular/router';

export const routes: Routes = [
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
];
