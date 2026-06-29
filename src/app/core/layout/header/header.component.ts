import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WalletStore } from '../../store/wallet.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, XofPipe, PhoneFormatPipe],
  template: `
    <header class="app-header-bar">
      <div class="brand">
        <div class="logo-circle">
          <span>BW</span>
        </div>
        <div class="brand-text">
          <h1>BadWallet</h1>
          <p>Dashboard</p>
        </div>
      </div>

      <div class="header-right">
        @if (store.currentRole()) {
          <div class="user-session">
            @if (store.currentRole() === 'CLIENT') {
              <div class="balance-display glass-card-mini">
                <span class="lbl">Solde Actuel</span>
                <span class="val">{{ store.balance() | xof }}</span>
              </div>

              <div class="session-info">
                <span class="role-badge client">Client</span>
                <span class="phone">{{ store.currentPhone() | phoneFormat }}</span>
              </div>
            } @else if (store.currentRole() === 'AGENT') {
              <div class="session-info">
                <span class="role-badge agent">Agent Guichet</span>
                <span class="admin-label">Administration</span>
              </div>
            }
          </div>

          <button (click)="logout()" class="btn-logout" title="Se déconnecter">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Déconnexion</span>
          </button>
        }
      </div>
    </header>
  `,
  styles: [`
    .app-header-bar {
      height: 75px;
      background: rgba(19, 26, 44, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      z-index: 100;
      position: sticky;
      top: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .logo-circle {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 1.1rem;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .brand-text p {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-session {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .glass-card-mini {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      padding: 0.4rem 1rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .balance-display .lbl {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--text-secondary);
      letter-spacing: 0.05em;
    }

    .balance-display .val {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--accent-success);
    }

    .session-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.2rem;
    }

    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .role-badge.client {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .role-badge.agent {
      background: rgba(217, 70, 239, 0.15);
      color: var(--accent-secondary);
      border: 1px solid rgba(217, 70, 239, 0.3);
    }

    .phone {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 600;
    }

    .admin-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .btn-logout {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-danger);
      border-color: rgba(239, 68, 68, 0.3);
    }
  `]
})
export class HeaderComponent {
  readonly store = inject(WalletStore);
  private router = inject(Router);

  logout() {
    this.store.clearSession();
    this.router.navigate(['/login']);
  }
}
