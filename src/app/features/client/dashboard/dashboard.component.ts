import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletStore } from '../../../core/store/wallet.store';
import { WalletApiService, Transaction } from '../../../core/services/wallet-api.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, XofPipe, PhoneFormatPipe],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Bonjour, {{ store.activeWallet()?.email }}</h2>
        <p class="page-subtitle">Bienvenue sur votre espace personnel BadWallet</p>
      </div>
      
      <div class="header-actions">
        <a routerLink="/transfer" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Faire un Transfert</span>
        </a>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid-stats mb-4">
      <div class="glass-card stat-card balance-card">
        <div class="stat-icon-wrapper income">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Solde Disponible</span>
          <h3 class="stat-val text-success">{{ store.balance() | xof }}</h3>
        </div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-icon-wrapper deposit">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Total Revenus</span>
          <h3 class="stat-val text-info">{{ totalIncome | xof }}</h3>
        </div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-icon-wrapper expense">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-lbl">Total Dépenses</span>
          <h3 class="stat-val text-danger">{{ totalExpenses | xof }}</h3>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Recent Transactions -->
      <div class="col-md-7 mb-4">
        <div class="glass-card h-100">
          <div class="card-header-flex mb-3">
            <h3>Dernières Activités</h3>
            <a routerLink="/transactions" class="text-link">Voir tout</a>
          </div>

          @if (isLoading) {
            <div class="loading-state-mini">
              <div class="spinner"></div>
            </div>
          } @else {
            @if (recentTransactions.length === 0) {
              <div class="empty-state-mini">
                <p>Aucune transaction enregistrée pour le moment.</p>
              </div>
            } @else {
              <div class="transactions-list-mini">
                @for (tx of recentTransactions; track tx.id) {
                  <div class="tx-item-mini">
                    <div class="tx-type-icon" [class]="getTxClass(tx.type)">
                      @if (tx.type === 'DEPOSIT') {
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                      }
                    </div>
                    <div class="tx-details-mini">
                      <span class="tx-desc">{{ tx.description || getTxLabel(tx.type) }}</span>
                      <span class="tx-date">{{ tx.createdAt | date: 'dd MMM yyyy, HH:mm' }}</span>
                    </div>
                    <div class="tx-amount-mini font-bold" [class]="getTxAmountClass(tx.type)">
                      {{ (tx.type === 'DEPOSIT' ? '+' : '-') }}{{ tx.amount | xof }}
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>

      <!-- Financial Chart Dashboard (SVG representation) -->
      <div class="col-md-5 mb-4">
        <div class="glass-card h-100">
          <h3>Répartition des Budgets</h3>
          <p class="text-muted mb-4">Aperçu visuel de vos flux financiers récents</p>

          <div class="chart-content">
            <!-- Custom Dynamic SVG Pie Chart -->
            <div class="svg-chart-container">
              <svg width="180" height="180" viewBox="0 0 36 36" class="donut-chart">
                <circle class="donut-ring" cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" stroke-width="3"></circle>
                
                @if (incomeRatio > 0 || expenseRatio > 0) {
                  <!-- Income segment (Green) -->
                  <circle 
                    class="donut-segment" 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="transparent" 
                    stroke="var(--accent-success)" 
                    stroke-width="3"
                    [attr.stroke-dasharray]="incomeRatio + ' ' + (100 - incomeRatio)"
                    stroke-dashoffset="25"
                  ></circle>
                  
                  <!-- Expense segment (Red) -->
                  <circle 
                    class="donut-segment" 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="transparent" 
                    stroke="var(--accent-danger)" 
                    stroke-width="3"
                    [attr.stroke-dasharray]="expenseRatio + ' ' + (100 - expenseRatio)"
                    [attr.stroke-dashoffset]="125 - incomeRatio"
                  ></circle>
                } @else {
                  <circle class="donut-segment" cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--text-muted)" stroke-width="3" stroke-dasharray="100 0" stroke-dashoffset="25"></circle>
                }
              </svg>
              
              <div class="donut-center-overlay">
                <span class="pct font-bold">{{ incomeRatio | number: '1.0-0' }}%</span>
                <span class="lbl">Revenus</span>
              </div>
            </div>

            <div class="chart-legend mt-3">
              <div class="legend-item">
                <span class="legend-color success"></span>
                <span class="legend-lbl">Revenus ({{ incomeRatio | number: '1.0-0' }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-color danger"></span>
                <span class="legend-lbl">Dépenses ({{ expenseRatio | number: '1.0-0' }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem 2rem;
    }

    .balance-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(20, 29, 48, 0.7));
      border-color: rgba(99, 102, 241, 0.25);
    }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-wrapper.income {
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-success);
    }

    .stat-icon-wrapper.deposit {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .stat-icon-wrapper.expense {
      background: rgba(239, 68, 68, 0.15);
      color: var(--accent-danger);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-lbl {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--text-secondary);
      letter-spacing: 0.05em;
    }

    .stat-val {
      font-size: 1.5rem;
      font-weight: 800;
      margin-top: 0.15rem;
    }

    .text-danger { color: var(--accent-danger); }
    .text-info { color: var(--accent-primary); }
    .text-success { color: var(--accent-success); }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    .font-bold { font-weight: 700; }
    .h-100 { height: 100%; }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }

    .col-md-7 {
      flex: 0 0 58.3333%;
      max-width: 58.3333%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .col-md-5 {
      flex: 0 0 41.6667%;
      max-width: 41.6667%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .text-link {
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .text-link:hover {
      text-decoration: underline;
    }

    .loading-state-mini, .empty-state-mini {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
    }

    .transactions-list-mini {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .tx-item-mini {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .tx-item-mini:hover {
      border-color: rgba(99, 102, 241, 0.15);
      background: rgba(255, 255, 255, 0.04);
    }

    .tx-type-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tx-type-icon.in {
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-success);
    }

    .tx-type-icon.out {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-danger);
    }

    .tx-details-mini {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .tx-desc {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .tx-date {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    .tx-amount-mini {
      font-size: 0.95rem;
    }

    .tx-amt-in {
      color: var(--accent-success);
    }

    .tx-amt-out {
      color: var(--text-primary);
    }

    .chart-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem 0;
    }

    .svg-chart-container {
      position: relative;
      width: 180px;
      height: 180px;
    }

    .donut-chart {
      transform: rotate(-90deg);
    }

    .donut-segment {
      transition: stroke-dasharray 0.5s ease;
    }

    .donut-center-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
    }

    .donut-center-overlay .pct {
      font-size: 1.5rem;
      color: var(--text-primary);
    }

    .donut-center-overlay .lbl {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chart-legend {
      display: flex;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .legend-color.success { background-color: var(--accent-success); }
    .legend-color.danger { background-color: var(--accent-danger); }

    .legend-lbl {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .col-md-7, .col-md-5 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly store = inject(WalletStore);
  private walletApi = inject(WalletApiService);

  recentTransactions: Transaction[] = [];
  isLoading = false;

  totalIncome = 0;
  totalExpenses = 0;
  incomeRatio = 0;
  expenseRatio = 0;

  ngOnInit() {
    this.store.refreshActiveWallet();
    this.loadTransactions();
  }

  loadTransactions() {
    const phone = this.store.currentPhone();
    if (!phone) return;

    this.isLoading = true;
    this.walletApi.listerTransactions(phone).subscribe({
      next: (txs) => {
        // Sort descending by date
        txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.recentTransactions = txs.slice(0, 4);

        // Compute metrics
        let income = 0;
        let expenses = 0;
        txs.forEach(t => {
          if (t.type === 'DEPOSIT') {
            income += t.amount;
          } else {
            expenses += t.amount;
          }
        });
        this.totalIncome = income;
        this.totalExpenses = expenses;

        const total = income + expenses;
        if (total > 0) {
          this.incomeRatio = (income / total) * 100;
          this.expenseRatio = (expenses / total) * 100;
        } else {
          this.incomeRatio = 0;
          this.expenseRatio = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTxClass(type: string): string {
    return type === 'DEPOSIT' ? 'in' : 'out';
  }

  getTxAmountClass(type: string): string {
    return type === 'DEPOSIT' ? 'tx-amt-in' : 'tx-amt-out';
  }

  getTxLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'Dépôt';
      case 'WITHDRAWAL': return 'Retrait';
      case 'TRANSFER': return 'Transfert d\'argent';
      case 'PAYMENT': return 'Paiement Facture';
      default: return 'Transaction';
    }
  }
}
