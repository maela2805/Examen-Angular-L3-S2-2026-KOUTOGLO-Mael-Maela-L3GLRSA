import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletStore } from '../../../core/store/wallet.store';
import { WalletApiService, Transaction } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Historique des mouvements</h2>
        <p class="page-subtitle">Consultez et filtrez tous les flux financiers de votre compte</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="glass-card filter-card mb-4">
      <div class="filter-row">
        <div class="filter-item">
          <label class="form-label">Type :</label>
          <select [(ngModel)]="typeFilter" (change)="applyFilters()" class="form-control">
            <option value="">Tous les types</option>
            <option value="DEPOSIT">Dépôts</option>
            <option value="WITHDRAWAL">Retraits</option>
            <option value="TRANSFER">Transferts</option>
            <option value="PAYMENT">Paiements de factures</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label">Du :</label>
          <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" class="form-control" />
        </div>

        <div class="filter-item">
          <label class="form-label">Au :</label>
          <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" class="form-control" />
        </div>

        <div class="filter-item align-self-end">
          <button (click)="resetFilters()" class="btn btn-secondary w-100">Réinitialiser</button>
        </div>
      </div>
    </div>

    @if (isLoading) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des transactions...</p>
      </div>
    } @else {
      @if (filteredTransactions.length === 0) {
        <div class="glass-card empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3>Aucune transaction trouvée</h3>
          <p>Aucun mouvement de compte ne correspond aux filtres appliqués.</p>
        </div>
      } @else {
        <!-- Transactions Table -->
        <div class="table-responsive glass-card no-padding">
          <table class="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant Brut</th>
                <th>Frais</th>
                <th>Montant Net</th>
                <th>Description</th>
                <th>Date / Heure</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of filteredTransactions; track tx.id) {
                <tr>
                  <td>
                    <span class="badge" [class]="getBadgeClass(tx.type)">
                      {{ getTxLabel(tx.type) }}
                    </span>
                  </td>
                  <td class="font-bold">{{ tx.amount | xof }}</td>
                  <td class="text-muted">{{ tx.fees | xof }}</td>
                  <td class="font-bold text-success">{{ tx.netAmount | xof }}</td>
                  <td>{{ tx.description || '—' }}</td>
                  <td>{{ tx.createdAt | date: 'dd MMM yyyy, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
  styles: [`
    .mb-4 { margin-bottom: 1.5rem; }
    .no-padding { padding: 0; overflow: hidden; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }
    .text-muted { color: var(--text-muted); }
    .w-100 { width: 100%; }

    .filter-card {
      padding: 1.5rem;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: flex-end;
    }

    .filter-item {
      flex: 1;
      min-width: 180px;
    }

    .align-self-end {
      align-self: flex-end;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      text-align: center;
      gap: 1rem;
      color: var(--text-secondary);
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private store = inject(WalletStore);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading = false;

  typeFilter = '';
  startDate = '';
  endDate = '';

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    const phone = this.store.currentPhone();
    if (!phone) return;

    this.isLoading = true;
    this.walletApi.listerTransactions(phone).subscribe({
      next: (txs) => {
        // Sort descending by date
        this.allTransactions = txs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error("Erreur lors de la récupération des transactions.");
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredTransactions = this.allTransactions.filter((tx) => {
      // 1. Filter by type
      if (this.typeFilter && tx.type !== this.typeFilter) {
        return false;
      }

      // 2. Filter by start date
      if (this.startDate) {
        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0);
        const txDate = new Date(tx.createdAt);
        if (txDate < start) return false;
      }

      // 3. Filter by end date
      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);
        const txDate = new Date(tx.createdAt);
        if (txDate > end) return false;
      }

      return true;
    });
  }

  resetFilters() {
    this.typeFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'badge-success';
      case 'WITHDRAWAL':
        return 'badge-danger';
      case 'TRANSFER':
        return 'badge-info';
      case 'PAYMENT':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }

  getTxLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'Dépôt';
      case 'WITHDRAWAL':
        return 'Retrait';
      case 'TRANSFER':
        return 'Transfert';
      case 'PAYMENT':
        return 'Paiement Facture';
      default:
        return 'Transaction';
    }
  }
}
