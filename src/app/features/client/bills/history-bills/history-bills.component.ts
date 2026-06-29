import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletStore } from '../../../../core/store/wallet.store';
import { BillingApiService, Facture } from '../../../../core/services/billing-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { XofPipe } from '../../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-history-bills',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    @if (isLoading) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Récupération de l'historique de vos paiements...</p>
      </div>
    } @else {
      @if (paidFactures.length === 0) {
        <div class="glass-card empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3>Aucun paiement enregistré</h3>
          <p>Vous n'avez effectué aucun paiement de facture de service ce mois-ci.</p>
        </div>
      } @else {
        <!-- Paid Invoices History -->
        <div class="table-responsive glass-card no-padding">
          <table class="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Période</th>
                <th>Date d'émission</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (f of paidFactures; track f.id) {
                <tr>
                  <td><span class="code-badge">{{ f.reference }}</span></td>
                  <td>
                    <span class="provider-badge" [class]="f.unite.toLowerCase()">
                      {{ f.unite }}
                    </span>
                  </td>
                  <td>{{ f.periode }}</td>
                  <td>{{ f.dateFact | date: 'dd MMM yyyy' }}</td>
                  <td class="font-bold text-success">{{ f.montant | xof }}</td>
                  <td><span class="badge badge-success">PAYÉE</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
  styles: [`
    .no-padding { padding: 0; overflow: hidden; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }

    .provider-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      border-radius: 4px;
    }

    .provider-badge.woyafal {
      background: rgba(245, 158, 11, 0.1);
      color: var(--accent-warning);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .provider-badge.ism {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-primary);
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .code-badge {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      gap: 1rem;
      color: var(--text-secondary);
    }
  `]
})
export class HistoryBillsComponent implements OnInit {
  private store = inject(WalletStore);
  private billingApi = inject(BillingApiService);
  private toast = inject(ToastService);

  paidFactures: Facture[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const code = this.store.walletCode();
    if (!code) return;

    this.isLoading = true;
    
    // Set a broad period search (2026-01-01 to 2026-12-31)
    this.billingApi.getFacturesPeriode(code, '2026-01-01', '2026-12-31').subscribe({
      next: (data) => {
        // Filter for paid invoices only
        this.paidFactures = data.filter(f => f.statut === 'PAYEE');
        this.isLoading = false;
      },
      error: () => {
        this.toast.error("Erreur lors de la récupération de l'historique.");
        this.isLoading = false;
      }
    });
  }
}
