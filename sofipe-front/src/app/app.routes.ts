import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },
      {
        path: 'painel',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'empresas/nova',
        loadComponent: () =>
          import('./pages/empresa-form/empresa-form').then((m) => m.EmpresaFormPage),
      },
      {
        path: 'empresas/:id/analise',
        loadComponent: () => import('./pages/analise/analise').then((m) => m.AnalisePage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
