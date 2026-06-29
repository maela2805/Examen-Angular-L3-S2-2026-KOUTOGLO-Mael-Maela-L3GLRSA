import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Paiement de Services (Factures)</h2>
        <p class="page-subtitle">Réglez vos factures d'eau, électricité (WOYAFAL, ISM) en un clic</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-container mb-4">
      <a routerLink="./current" routerLinkActive="active" class="tab-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>Factures impayées du mois</span>
      </a>
      <a routerLink="./history" routerLinkActive="active" class="tab-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Historique des paiements</span>
      </a>
    </div>

    <!-- Child Routes Container -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    .mb-4 { margin-bottom: 1.5rem; }

    .tabs-container {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      gap: 1.5rem;
    }

    .tab-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .tab-link:hover {
      color: var(--text-primary);
    }

    .tab-link.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }
  `]
})
export class BillsComponent {}
