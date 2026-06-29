import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WalletApiService, Wallet, Page } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, XofPipe, PhoneFormatPipe],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestion des Portefeuilles</h2>
        <p class="page-subtitle">Visualisez et gérez les comptes clients BadWallet</p>
      </div>
      
      <div class="header-actions">
        <button (click)="onSeed()" [disabled]="isSeeding" class="btn btn-secondary mr-2">
          @if (isSeeding) {
            <div class="spinner"></div>
            <span>Seeding en cours...</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Initialiser Données (Seed)</span>
          }
        </button>
        <a routerLink="/admin/wallets/create" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Créer un Portefeuille</span>
        </a>
      </div>
    </div>

    <!-- Search bar -->
    <div class="glass-card search-card mb-4">
      <form (submit)="onSearch()" class="search-form">
        <div class="search-input-group">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            [(ngModel)]="searchPhone" 
            name="searchPhone" 
            placeholder="Rechercher par numéro de téléphone (ex: +221770000003)" 
            class="form-control search-control"
          />
        </div>
        <button type="submit" class="btn btn-primary search-btn">Rechercher</button>
        @if (isSearched) {
          <button type="button" (click)="resetSearch()" class="btn btn-secondary">Réinitialiser</button>
        }
      </form>
    </div>

    @if (isLoading) {
      <div class="loading-state">
        <div class="spinner large"></div>
        <p>Chargement des portefeuilles...</p>
      </div>
    } @else {
      @if (wallets.length === 0) {
        <div class="glass-card empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
          <h3>Aucun portefeuille trouvé</h3>
          <p>La base de données est actuellement vide ou aucun compte ne correspond à votre recherche.</p>
          <button (click)="onSeed()" [disabled]="isSeeding" class="btn btn-primary mt-3">Initialiser avec des données de test</button>
        </div>
      } @else {
        <!-- Wallets Table -->
        <div class="table-responsive glass-card no-padding">
          <table class="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Téléphone</th>
                <th>E-mail</th>
                <th>Solde actuel</th>
                <th>Devise</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (w of wallets; track w.id) {
                <tr>
                  <td>
                    <span class="code-badge">{{ w.code }}</span>
                  </td>
                  <td class="font-semibold">{{ w.phoneNumber | phoneFormat }}</td>
                  <td>{{ w.email }}</td>
                  <td class="font-bold text-success">{{ w.balance | xof }}</td>
                  <td><span class="badge badge-info">{{ w.currency }}</span></td>
                  <td>
                    <div class="action-buttons">
                      <a [routerLink]="['/admin/wallets/operations']" [queryParams]="{ id: w.id, phone: w.phoneNumber }" class="btn-action" title="Effectuer un dépôt ou retrait">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span>Opération</span>
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination (only if not a specific search result) -->
        @if (!isSearched && pageInfo) {
          <div class="pagination-container mt-4">
            <span class="pagination-info">
              Page <strong>{{ pageInfo.number + 1 }}</strong> sur <strong>{{ pageInfo.totalPages }}</strong> ({{ pageInfo.totalElements }} portefeuilles)
            </span>
            <div class="pagination-controls">
              <button 
                [disabled]="pageInfo.number === 0" 
                (click)="goToPage(pageInfo.number - 1)" 
                class="btn btn-secondary btn-sm"
              >
                Précédent
              </button>
              <button 
                [disabled]="pageInfo.number + 1 >= pageInfo.totalPages" 
                (click)="goToPage(pageInfo.number + 1)" 
                class="btn btn-secondary btn-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        }
      }
    }
  `,
  styles: [`
    .mr-2 { margin-right: 0.75rem; }
    .mt-3 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .font-semibold { font-weight: 500; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }
    .no-padding { padding: 0; overflow: hidden; }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .search-card {
      padding: 1.25rem 2rem;
    }

    .search-form {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-input-group {
      flex: 1;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-control {
      padding-left: 3rem;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      text-align: center;
      gap: 1rem;
    }

    .empty-state svg {
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .empty-state p {
      color: var(--text-secondary);
      max-width: 500px;
    }

    .spinner.large {
      width: 3rem;
      height: 3rem;
      border-width: 3px;
    }

    .code-badge {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      background: var(--accent-primary);
      color: white;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-info {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
  `]
})
export class WalletsComponent implements OnInit {
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);

  wallets: Wallet[] = [];
  pageInfo: Page<Wallet> | null = null;
  currentPage = 0;
  isLoading = false;

  searchPhone = '';
  isSearched = false;
  isSeeding = false;

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.isLoading = true;
    this.walletApi.listerWallets(this.currentPage, 10).subscribe({
      next: (page) => {
        this.wallets = page.content;
        this.pageInfo = page;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des portefeuilles.');
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchPhone.trim()) return;
    
    this.isLoading = true;
    this.walletApi.consulterWallet(this.searchPhone.trim()).subscribe({
      next: (wallet) => {
        this.wallets = [wallet];
        this.isSearched = true;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error(`Aucun portefeuille trouvé pour le numéro: ${this.searchPhone}`);
        this.isLoading = false;
      }
    });
  }

  resetSearch() {
    this.searchPhone = '';
    this.isSearched = false;
    this.loadWallets();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadWallets();
  }

  onSeed() {
    this.isSeeding = true;
    this.walletApi.seeder(10, 100).subscribe({
      next: (res) => {
        this.toast.success('Seeding démarré en tâche de fond !');
        // Wait 3 seconds and reload the page
        setTimeout(() => {
          this.isSeeding = false;
          this.loadWallets();
        }, 3000);
      },
      error: () => {
        this.toast.error('Erreur lors du lancement du seeding.');
        this.isSeeding = false;
      }
    });
  }
}
