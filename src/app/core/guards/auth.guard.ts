import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { WalletStore } from '../store/wallet.store';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(WalletStore);
  const router = inject(Router);

  const role = store.currentRole();
  const expectedRole = route.data?.['role'] as 'AGENT' | 'CLIENT' | undefined;

  if (!role) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRole && role !== expectedRole) {
    if (role === 'AGENT') {
      router.navigate(['/admin/wallets']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  return true;
};
