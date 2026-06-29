import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WalletApiService, Wallet } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, XofPipe, PhoneFormatPipe],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Opérations de Guichet</h2>
        <p class="page-subtitle">Créditer ou débiter le compte d'un client</p>
      </div>
      <a routerLink="/admin/wallets" class="btn btn-secondary">
        Retour à la liste
      </a>
    </div>

    <div class="row">
      <!-- Target Wallet Details -->
      @if (targetWallet) {
        <div class="col-md-4 mb-4">
          <div class="glass-card info-card">
            <h3>Compte Sélectionné</h3>
            <div class="info-list mt-3">
              <div class="info-row">
                <span class="lbl">Code Portefeuille</span>
                <span class="val font-semibold">{{ targetWallet.code }}</span>
              </div>
              <div class="info-row">
                <span class="lbl">Téléphone</span>
                <span class="val font-semibold">{{ targetWallet.phoneNumber | phoneFormat }}</span>
              </div>
              <div class="info-row">
                <span class="lbl">Adresse E-mail</span>
                <span class="val">{{ targetWallet.email }}</span>
              </div>
              <div class="info-row highlight">
                <span class="lbl">Solde Actuel</span>
                <span class="val text-success font-bold">{{ targetWallet.balance | xof }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Operation Form -->
      <div [class]="targetWallet ? 'col-md-8' : 'col-md-12'">
        <div class="glass-card">
          <form [formGroup]="operationForm" (ngSubmit)="onSubmit()" class="form-container">
            <!-- If no target wallet selected initially, ask for phone number -->
            @if (!walletId) {
              <div class="form-group">
                <label class="form-label">Numéro de téléphone du client</label>
                <input 
                  type="text" 
                  formControlName="phoneNumber" 
                  class="form-control" 
                  placeholder="Ex: +221770000003"
                  (blur)="lookupWalletByPhone()"
                />
                @if (operationForm.get('phoneNumber')?.touched && operationForm.get('phoneNumber')?.errors?.['required']) {
                  <span class="error-msg">Le numéro de téléphone est obligatoire</span>
                }
              </div>
            }

            <div class="form-group">
              <label class="form-label">Type d'opération</label>
              <select formControlName="type" class="form-control" (change)="onTypeChange()">
                <option value="DEPOSIT">Dépôt (Créditer)</option>
                <option value="WITHDRAWAL">Retrait (Débiter)</option>
              </select>
            </div>

            @if (isDeposit()) {
              <div class="form-group">
                <label class="form-label">Méthode de Dépôt</label>
                <select formControlName="paymentMethod" class="form-control">
                  <option value="CREDIT_CARD">Carte Bancaire (Sans frais)</option>
                  <option value="WALLET_TARGET">Depuis un autre portefeuille (Frais: 1%)</option>
                </select>
              </div>
            }

            <div class="form-group">
              <label class="form-label">Montant (XOF)</label>
              <input 
                type="number" 
                formControlName="amount" 
                class="form-control" 
                placeholder="Ex: 5000"
                min="1"
              />
              @if (operationForm.get('amount')?.touched && operationForm.get('amount')?.errors) {
                <div class="error-msg">
                  @if (operationForm.get('amount')?.errors?.['required']) {
                    <span>Le montant est requis</span>
                  }
                  @if (operationForm.get('amount')?.errors?.['min']) {
                    <span>Le montant doit être supérieur à 0</span>
                  }
                </div>
              }
            </div>

            <div class="form-actions mt-4">
              <button type="submit" [disabled]="operationForm.invalid || isLoading || !targetWallet" class="btn btn-primary">
                @if (isLoading) {
                  <div class="spinner"></div>
                  <span>Traitement...</span>
                } @else {
                  <span>Valider l'opération</span>
                }
              </button>
              <a routerLink="/admin/wallets" class="btn btn-secondary">Annuler</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }

    .col-md-4 {
      flex: 0 0 33.3333%;
      max-width: 33.3333%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .col-md-8 {
      flex: 0 0 66.6667%;
      max-width: 66.6667%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .col-md-12 {
      flex: 0 0 100%;
      max-width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .mb-4 { margin-bottom: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .font-semibold { font-weight: 500; }
    .font-bold { font-weight: 700; }
    .text-success { color: var(--accent-success); }

    .info-card h3 {
      font-size: 1.15rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .info-row .lbl {
      color: var(--text-secondary);
    }

    .info-row .val {
      color: var(--text-primary);
    }

    .info-row.highlight {
      background: rgba(255, 255, 255, 0.02);
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px dashed var(--border-color);
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .col-md-4, .col-md-8 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  `]
})
export class OperationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);

  operationForm: FormGroup;
  walletId: number | null = null;
  targetWallet: Wallet | null = null;
  isLoading = false;

  constructor() {
    this.operationForm = this.fb.group({
      phoneNumber: [''],
      type: ['DEPOSIT', Validators.required],
      paymentMethod: ['CREDIT_CARD'],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Read Query Params
    const idParam = this.route.snapshot.queryParamMap.get('id');
    const phoneParam = this.route.snapshot.queryParamMap.get('phone');

    if (idParam && phoneParam) {
      this.walletId = parseInt(idParam);
      this.operationForm.patchValue({ phoneNumber: phoneParam });
      this.loadWalletDetails(phoneParam);
    }
  }

  isDeposit(): boolean {
    return this.operationForm.get('type')?.value === 'DEPOSIT';
  }

  onTypeChange() {
    const type = this.operationForm.get('type')?.value;
    if (type === 'DEPOSIT') {
      this.operationForm.get('paymentMethod')?.setValidators(Validators.required);
    } else {
      this.operationForm.get('paymentMethod')?.clearValidators();
    }
    this.operationForm.get('paymentMethod')?.updateValueAndValidity();
  }

  lookupWalletByPhone() {
    const phone = this.operationForm.get('phoneNumber')?.value;
    if (!phone || phone.trim() === '') return;

    this.loadWalletDetails(phone.trim());
  }

  private loadWalletDetails(phone: string) {
    this.walletApi.consulterWallet(phone).subscribe({
      next: (wallet) => {
        this.targetWallet = wallet;
        if (wallet.id) {
          this.walletId = wallet.id;
        }
      },
      error: () => {
        this.toast.error(`Aucun portefeuille trouvé pour le numéro: ${phone}`);
        this.targetWallet = null;
        this.walletId = null;
      }
    });
  }

  onSubmit() {
    if (this.operationForm.invalid || !this.targetWallet) return;

    this.isLoading = true;
    const { type, paymentMethod, amount } = this.operationForm.value;

    if (type === 'DEPOSIT') {
      if (!this.walletId) return;
      this.walletApi.effectuerDepot(this.walletId, amount, paymentMethod).subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success(`Dépôt de ${amount} XOF effectué avec succès.`);
          this.router.navigate(['/admin/wallets']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message || 'Erreur lors du dépôt.';
          this.toast.error(msg);
        }
      });
    } else {
      // Withdrawal
      const phone = this.targetWallet.phoneNumber;
      this.walletApi.effectuerRetrait(phone, amount).subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success(`Retrait de ${amount} XOF (frais de 1% inclus) effectué.`);
          this.router.navigate(['/admin/wallets']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message || 'Erreur lors du retrait.';
          this.toast.error(msg);
        }
      });
    }
  }
}
