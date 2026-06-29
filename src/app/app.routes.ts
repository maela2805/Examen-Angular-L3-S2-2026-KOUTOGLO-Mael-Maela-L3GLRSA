import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin/wallets',
    loadComponent: () => import('./features/admin/wallets/wallets.component').then(m => m.WalletsComponent),
    canActivate: [authGuard],
    data: { role: 'AGENT' }
  },
  {
    path: 'admin/wallets/create',
    loadComponent: () => import('./features/admin/wallet-create/wallet-create.component').then(m => m.WalletCreateComponent),
    canActivate: [authGuard],
    data: { role: 'AGENT' }
  },
  {
    path: 'admin/wallets/operations',
    loadComponent: () => import('./features/admin/operations/operations.component').then(m => m.OperationsComponent),
    canActivate: [authGuard],
    data: { role: 'AGENT' }
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
