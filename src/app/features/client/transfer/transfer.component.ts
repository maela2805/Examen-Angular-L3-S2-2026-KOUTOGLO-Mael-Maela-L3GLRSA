import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WalletStore } from '../../../core/store/wallet.store';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { phoneValidator, differentPhoneValidator } from '../../../shared/validators/phone.validator';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Transfert d'argent</h2>
        <p class="page-subtitle">Envoyez des fonds instantanément à un autre compte client BadWallet</p>
      </div>
      <a routerLink="/dashboard" class="btn btn-secondary">
        Retour au Tableau de bord
      </a>
    </div>

    <div class="glass-card transfer-card">
      <div class="sender-preview mb-4">
        <span class="preview-lbl">Débité depuis votre compte :</span>
        <span class="preview-val font-semibold">{{ store.activeWallet()?.phoneNumber }} ({{ store.activeWallet()?.code }})</span>
      </div>

      <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-group">
          <label class="form-label">Numéro de téléphone du destinataire</label>
          <input 
            type="text" 
            formControlName="destination" 
            class="form-control" 
            placeholder="Ex: +221770000001"
          />
          @if (transferForm.get('destination')?.touched && transferForm.get('destination')?.errors) {
            <div class="error-msg">
              @if (transferForm.get('destination')?.errors?.['required']) {
                <span>Le numéro destinataire est obligatoire</span>
              }
              @if (transferForm.get('destination')?.errors?.['invalidPhone']) {
                <span>Le format du numéro doit être valide (ex: +221 77 123 45 67)</span>
              }
            </div>
          }
          @if (transferForm.errors?.['samePhone']) {
            <span class="error-msg">Le numéro du destinataire doit être différent du vôtre</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label">Montant à transférer (XOF)</label>
          <input 
            type="number" 
            formControlName="amount" 
            class="form-control" 
            placeholder="Montant en XOF"
            min="1"
          />
          @if (transferForm.get('amount')?.touched && transferForm.get('amount')?.errors) {
            <div class="error-msg">
              @if (transferForm.get('amount')?.errors?.['required']) {
                <span>Le montant est obligatoire</span>
              }
              @if (transferForm.get('amount')?.errors?.['min']) {
                <span>Le montant doit être supérieur à 0</span>
              }
            </div>
          }
        </div>

        <div class="form-group">
          <label class="form-label">Description / Motif (Optionnel)</label>
          <input 
            type="text" 
            formControlName="description" 
            class="form-control" 
            placeholder="Ex: Cadeau anniversaire, Remboursement..."
          />
        </div>

        <div class="form-actions mt-4">
          <button type="submit" [disabled]="transferForm.invalid || isLoading" class="btn btn-primary">
            @if (isLoading) {
              <div class="spinner"></div>
              <span>Envoi en cours...</span>
            } @else {
              <span>Confirmer le transfert</span>
            }
          </button>
          <a routerLink="/dashboard" class="btn btn-secondary">Annuler</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .transfer-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .sender-preview {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-color);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .sender-preview .preview-lbl {
      color: var(--text-secondary);
    }

    .sender-preview .preview-val {
      color: var(--accent-primary);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    .font-semibold { font-weight: 500; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
  `]
})
export class TransferComponent {
  readonly store = inject(WalletStore);
  private fb = inject(FormBuilder);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  transferForm: FormGroup;
  isLoading = false;

  constructor() {
    const currentPhone = this.store.currentPhone();
    this.transferForm = this.fb.group({
      destination: ['', [Validators.required, phoneValidator()]],
      amount: [null, [Validators.required, Validators.min(1)]],
      description: ['']
    }, {
      validators: differentPhoneValidator(currentPhone)
    });
  }

  onSubmit() {
    if (this.transferForm.invalid) return;

    const senderPhone = this.store.currentPhone();
    if (!senderPhone) {
      this.toast.error('Session invalide. Veuillez vous reconnecter.');
      return;
    }

    this.isLoading = true;
    const { destination, amount } = this.transferForm.value;

    this.walletApi.effectuerTransfert(senderPhone, destination, amount).subscribe({
      next: () => {
        this.isLoading = false;
        this.store.refreshActiveWallet();
        this.toast.success(`Le transfert de ${amount} XOF a été effectué avec succès !`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Erreur lors du transfert. Vérifiez les soldes.';
        this.toast.error(msg);
      }
    });
  }
}
