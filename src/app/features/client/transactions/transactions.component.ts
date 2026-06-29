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
              @for (tx of pagedTransactions; track tx.id) {
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

        <div class="pagination-bar glass-card mt-4">
          <div class="pagination-info">
            <span>{{ paginationSummary }}</span>
          </div>
          <div class="pagination-controls">
            <button class="btn-page" [disabled]="currentPage === 1" (click)="goToPage(1)">«</button>
            <button class="btn-page" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">‹</button>

            @for (p of pageNumbers; track p) {
              <button class="btn-page" [class.active]="p === currentPage" (click)="goToPage(p)">
                {{ p }}
              </button>
            }

            <button class="btn-page" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">›</button>
            <button class="btn-page" [disabled]="currentPage === totalPages" (click)="goToPage(totalPages)">»</button>
          </div>
          <div class="page-size-selector">
            <label>Lignes par page :</label>
            <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="form-control-sm">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
            </select>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .no-padding { padding: 0; overflow: hidden; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }
    .text-muted { color: var(--text-muted); }
    .w-100 { width: 100%; }

    .filter-card { padding: 1.5rem; }

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

    .align-self-end { align-self: flex-end; }

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

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .btn-page {
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.15);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .btn-page.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: white;
      font-weight: 700;
    }

    .btn-page:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .form-control-sm {
      padding: 0.25rem 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.85rem;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private store = inject(WalletStore);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  pagedTransactions: Transaction[] = [];
  isLoading = false;

  typeFilter = '';
  startDate = '';
  endDate = '';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  get pageNumbers(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeStart = Math.max(1, this.currentPage - delta);
    const rangeEnd = Math.min(this.totalPages, this.currentPage + delta);
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    return range;
  }

  get paginationSummary(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length);
    return `${start} – ${end} sur ${this.filteredTransactions.length} transaction(s)`;
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    const phone = this.store.currentPhone();
    if (!phone) return;

    this.isLoading = true;
    this.walletApi.listerTransactions(phone).subscribe({
      next: (txs) => {
        this.allTransactions = txs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Erreur lors de la récupération des transactions.');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredTransactions = this.allTransactions.filter((tx) => {
      if (this.typeFilter && !tx.type.includes(this.typeFilter)) return false;

      if (this.startDate) {
        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(tx.createdAt) < start) return false;
      }

      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(tx.createdAt) > end) return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters() {
    this.typeFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'badge-success';
      case 'WITHDRAWAL': return 'badge-danger';
      case 'TRANSFER':
      case 'TRANSFER_SEND':
      case 'TRANSFER_RECEIVE': return 'badge-info';
      case 'PAYMENT': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  getTxLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'Dépôt';
      case 'WITHDRAWAL': return 'Retrait';
      case 'TRANSFER':
      case 'TRANSFER_SEND': return 'Transfert envoyé';
      case 'TRANSFER_RECEIVE': return 'Transfert reçu';
      case 'PAYMENT': return 'Paiement Facture';
      default: return 'Transaction';
    }
  }
}
