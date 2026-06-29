import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { WalletStore } from '../../../../core/store/wallet.store';
import { BillingApiService, Facture } from '../../../../core/services/billing-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { XofPipe } from '../../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-current-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="filter-bar mb-3">
      <div class="filter-group">
        <label class="filter-label">Fournisseur :</label>
        <select [(ngModel)]="uniteFilter" (change)="loadFactures()" class="form-control filter-control">
          <option value="">Tous les fournisseurs</option>
          <option value="WOYAFAL">WOYAFAL (Électricité)</option>
          <option value="ISM">ISM (Scolarité)</option>
        </select>
      </div>

      @if (selectedFactures.size > 0) {
        <div class="payment-summary glass-card-mini">
          <span class="summary-text">
            <strong>{{ selectedFactures.size }}</strong> facture(s) sélectionnée(s) :
            <strong class="text-success">{{ totalSelectedAmount | xof }}</strong>
          </span>
          <button (click)="onPaySelected()" [disabled]="isPaying" class="btn btn-primary btn-sm">
            @if (isPaying) {
              <div class="spinner"></div>
              <span>Paiement...</span>
            } @else {
              <span>Payer en 1 clic</span>
            }
          </button>
        </div>
      }
    </div>

    @if (isLoading) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Recherche des factures impayées...</p>
      </div>
    } @else {
      @if (factures.length === 0) {
        <div class="glass-card empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 11.5L10.5 14L16 8"></path></svg>
          <h3>Aucune facture impayée</h3>
          <p>Félicitations, vous êtes à jour dans vos règlements pour ce mois !</p>
        </div>
      } @else {
        <!-- Invoices List -->
        <div class="table-responsive glass-card no-padding">
          <table class="table">
            <thead>
              <tr>
                <th width="40">
                  <input 
                    type="checkbox" 
                    [checked]="isAllSelected()" 
                    (change)="toggleSelectAll($event)"
                  />
                </th>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Période</th>
                <th>Date d'émission</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (f of factures; track f.id) {
                <tr>
                  <td>
                    <input 
                      type="checkbox" 
                      [checked]="selectedFactures.has(f)" 
                      (change)="toggleSelect(f)"
                    />
                  </td>
                  <td><span class="code-badge">{{ f.reference }}</span></td>
                  <td>
                    <span class="provider-badge" [class]="f.unite.toLowerCase()">
                      {{ f.unite }}
                    </span>
                  </td>
                  <td>{{ f.periode }}</td>
                  <td>{{ f.dateFact | date: 'dd MMM yyyy' }}</td>
                  <td class="font-bold">{{ f.montant | xof }}</td>
                  <td><span class="badge badge-warning">{{ f.statut }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .no-padding { padding: 0; overflow: hidden; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-control {
      width: 200px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .payment-summary {
      background: rgba(99, 102, 241, 0.05);
      border: 1px solid rgba(99, 102, 241, 0.2);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.5rem 1rem;
      border-radius: 10px;
    }

    .summary-text {
      font-size: 0.9rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

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

    .empty-state svg {
      color: var(--accent-success);
    }
  `]
})
export class CurrentBillsComponent implements OnInit {
  private store = inject(WalletStore);
  private billingApi = inject(BillingApiService);
  private toast = inject(ToastService);

  factures: Facture[] = [];
  selectedFactures = new Set<Facture>();
  totalSelectedAmount = 0;
  uniteFilter = '';
  isLoading = false;
  isPaying = false;

  ngOnInit() {
    this.loadFactures();
  }

  loadFactures() {
    const code = this.store.walletCode();
    if (!code) return;

    this.isLoading = true;
    this.selectedFactures.clear();
    this.totalSelectedAmount = 0;

    this.billingApi.getFacturesMoisCourant(code, this.uniteFilter || undefined).subscribe({
      next: (data) => {
        // Display only unpaid invoices
        this.factures = data.filter(f => f.statut === 'IMPAYEE');
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des factures.');
        this.isLoading = false;
      }
    });
  }

  toggleSelect(facture: Facture) {
    if (this.selectedFactures.has(facture)) {
      this.selectedFactures.delete(facture);
      this.totalSelectedAmount -= facture.montant;
    } else {
      this.selectedFactures.add(facture);
      this.totalSelectedAmount += facture.montant;
    }
  }

  isAllSelected(): boolean {
    return this.factures.length > 0 && this.selectedFactures.size === this.factures.length;
  }

  toggleSelectAll(event: any) {
    this.selectedFactures.clear();
    this.totalSelectedAmount = 0;
    
    if (event.target.checked) {
      this.factures.forEach(f => {
        this.selectedFactures.add(f);
        this.totalSelectedAmount += f.montant;
      });
    }
  }

  onPaySelected() {
    const phone = this.store.currentPhone();
    if (!phone || this.selectedFactures.size === 0) return;

    this.isPaying = true;

    // Group selected invoices by provider name (unite)
    const grouped: { [service: string]: string[] } = {};
    this.selectedFactures.forEach(f => {
      grouped[f.unite] = grouped[f.unite] || [];
      grouped[f.unite].push(f.reference);
    });

    // Create call list for forkJoin
    const requests = Object.keys(grouped).map(serviceName => {
      const refs = grouped[serviceName];
      return this.billingApi.payerFacturesMultiples(phone, serviceName, refs);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.isPaying = false;
        this.toast.success('Toutes les factures sélectionnées ont été payées !');
        this.store.refreshActiveWallet();
        this.loadFactures();
      },
      error: (err) => {
        this.isPaying = false;
        const msg = err?.error?.message || 'Erreur lors du paiement des factures. Solde insuffisant ?';
        this.toast.error(msg);
      }
    });
  }
}
