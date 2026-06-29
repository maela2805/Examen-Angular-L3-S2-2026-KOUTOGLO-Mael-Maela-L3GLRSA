import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletStore } from '../../store/wallet.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar">
      <div class="menu-section">
        <span class="menu-title">Menu principal</span>
        <nav class="nav-menu">
          @if (store.currentRole() === 'CLIENT') {
            <!-- Client links -->
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              <span>Dashboard</span>
            </a>

            <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>Transactions</span>
            </a>

            <a routerLink="/transfer" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3L21 7L17 11M3 17L7 21L11 17"></path><path d="M21 7H9M3 17H15"></path></svg>
              <span>Transfert d'argent</span>
            </a>

            <a routerLink="/bills" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
              <span>Paiement Factures</span>
            </a>
          } @else if (store.currentRole() === 'AGENT') {
            <!-- Agent links -->
            <a routerLink="/admin/wallets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Portefeuilles</span>
            </a>

            <a routerLink="/admin/wallets/create" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
              <span>Nouveau Client</span>
            </a>

            <a routerLink="/admin/wallets/operations" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Dépôt / Retrait</span>
            </a>
          }
        </nav>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 260px;
      background: rgba(19, 26, 44, 0.5);
      border-right: 1px solid var(--border-color);
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 75px);
      position: sticky;
      top: 75px;
    }

    .menu-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .menu-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      padding-left: 0.75rem;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(217, 70, 239, 0.05));
      color: var(--text-primary);
      border-left: 3px solid var(--accent-primary);
      padding-left: calc(1rem - 3px);
    }

    .nav-item svg {
      transition: transform 0.3s ease;
    }

    .nav-item:hover svg {
      transform: scale(1.1);
    }
  `]
})
export class SidebarComponent {
  readonly store = inject(WalletStore);
}
