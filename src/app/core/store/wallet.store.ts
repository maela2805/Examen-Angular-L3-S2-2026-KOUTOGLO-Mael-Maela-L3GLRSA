import { Injectable, signal, computed } from '@angular/core';
import { WalletApiService, Wallet } from '../services/wallet-api.service';

@Injectable({
  providedIn: 'root'
})
export class WalletStore {
  readonly currentRole = signal<'AGENT' | 'CLIENT' | null>(this.getStoredRole());
  readonly currentPhone = signal<string | null>(localStorage.getItem('wallet_phone'));
  readonly activeWallet = signal<Wallet | null>(null);

  readonly balance = computed(() => this.activeWallet()?.balance ?? 0);
  readonly walletCode = computed(() => this.activeWallet()?.code ?? '');

  constructor(private walletApi: WalletApiService) {
    const storedPhone = this.currentPhone();
    if (this.currentRole() === 'CLIENT' && storedPhone) {
      this.fetchWalletDetails(storedPhone);
    }
  }

  setRole(role: 'AGENT' | 'CLIENT' | null) {
    this.currentRole.set(role);
    if (role) {
      localStorage.setItem('wallet_role', role);
    } else {
      localStorage.removeItem('wallet_role');
      this.clearSession();
    }
  }

  setClientPhone(phone: string) {
    this.currentPhone.set(phone);
    localStorage.setItem('wallet_phone', phone);
    this.fetchWalletDetails(phone);
  }

  refreshActiveWallet() {
    const phone = this.currentPhone();
    if (phone) {
      this.fetchWalletDetails(phone);
    }
  }

  clearSession() {
    this.currentRole.set(null);
    this.currentPhone.set(null);
    this.activeWallet.set(null);
    localStorage.removeItem('wallet_role');
    localStorage.removeItem('wallet_phone');
  }

  private fetchWalletDetails(phone: string) {
    this.walletApi.consulterWallet(phone).subscribe({
      next: (wallet) => {
        this.activeWallet.set(wallet);
      },
      error: () => {
        this.activeWallet.set(null);
      }
    });
  }

  private getStoredRole(): 'AGENT' | 'CLIENT' | null {
    const role = localStorage.getItem('wallet_role');
    if (role === 'AGENT' || role === 'CLIENT') {
      return role;
    }
    return null;
  }
}
