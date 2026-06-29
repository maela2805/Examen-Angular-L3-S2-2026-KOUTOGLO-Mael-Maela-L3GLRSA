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
    path: 'dashboard',
    loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { role: 'CLIENT' }
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/client/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [authGuard],
    data: { role: 'CLIENT' }
  },
  {
    path: 'transfer',
    loadComponent: () => import('./features/client/transfer/transfer.component').then(m => m.TransferComponent),
    canActivate: [authGuard],
    data: { role: 'CLIENT' }
  },
  {
    path: 'bills',
    loadComponent: () => import('./features/client/bills/bills.component').then(m => m.BillsComponent),
    canActivate: [authGuard],
    data: { role: 'CLIENT' },
    children: [
      { path: '', redirectTo: 'current', pathMatch: 'full' },
      {
        path: 'current',
        loadComponent: () => import('./features/client/bills/current-bills/current-bills.component').then(m => m.CurrentBillsComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/client/bills/history-bills/history-bills.component').then(m => m.HistoryBillsComponent)
      }
    ]
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
