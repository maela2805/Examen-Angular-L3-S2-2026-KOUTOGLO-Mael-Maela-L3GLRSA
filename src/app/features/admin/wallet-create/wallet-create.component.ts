import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { phoneValidator } from '../../../shared/validators/phone.validator';

@Component({
  selector: 'app-wallet-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Nouveau Client</h2>
        <p class="page-subtitle">Créez un nouveau portefeuille électronique</p>
      </div>
      <a routerLink="/admin/wallets" class="btn btn-secondary">
        Retour à la liste
      </a>
    </div>

    <div class="glass-card create-card">
      <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="row">
          <div class="col-md-6 form-group">
            <label class="form-label">Numéro de téléphone (avec +221)</label>
            <input 
              type="text" 
              formControlName="phoneNumber" 
              class="form-control" 
              placeholder="Ex: +221770000003"
            />
            @if (createForm.get('phoneNumber')?.touched && createForm.get('phoneNumber')?.errors) {
              <div class="error-msg">
                @if (createForm.get('phoneNumber')?.errors?.['required']) {
                  <span>Le numéro de téléphone est requis</span>
                }
                @if (createForm.get('phoneNumber')?.errors?.['invalidPhone']) {
                  <span>Le format du numéro doit être valide (ex: +221 77 123 45 67)</span>
                }
              </div>
            }
          </div>

          <div class="col-md-6 form-group">
            <label class="form-label">Adresse e-mail</label>
            <input 
              type="email" 
              formControlName="email" 
              class="form-control" 
              placeholder="client@domaine.com"
            />
            @if (createForm.get('email')?.touched && createForm.get('email')?.errors) {
              <div class="error-msg">
                @if (createForm.get('email')?.errors?.['required']) {
                  <span>L'adresse e-mail est requise</span>
                }
                @if (createForm.get('email')?.errors?.['email']) {
                  <span>Veuillez entrer une adresse e-mail valide</span>
                }
              </div>
            }
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 form-group">
            <label class="form-label">Code Portefeuille</label>
            <div class="input-with-action">
              <input 
                type="text" 
                formControlName="code" 
                class="form-control" 
                placeholder="Ex: WLT-0000003"
              />
              <button type="button" (click)="generateCode()" class="btn btn-secondary btn-input-action">Générer</button>
            </div>
            @if (createForm.get('code')?.touched && createForm.get('code')?.errors?.['required']) {
              <span class="error-msg">Le code du portefeuille est requis</span>
            }
          </div>

          <div class="col-md-6 form-group">
            <label class="form-label">Devise</label>
            <select formControlName="currency" class="form-control">
              <option value="XOF">Franc CFA (XOF)</option>
              <option value="USD">Dollar Américain (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 form-group">
            <label class="form-label">Solde Initial</label>
            <input 
              type="number" 
              formControlName="initialBalance" 
              class="form-control" 
              placeholder="0"
              min="0"
            />
            @if (createForm.get('initialBalance')?.touched && createForm.get('initialBalance')?.errors) {
              <div class="error-msg">
                @if (createForm.get('initialBalance')?.errors?.['required']) {
                  <span>Le solde initial est requis</span>
                }
                @if (createForm.get('initialBalance')?.errors?.['min']) {
                  <span>Le solde initial doit être positif ou nul</span>
                }
              </div>
            }
          </div>
        </div>

        <div class="form-actions mt-4">
          <button type="submit" [disabled]="createForm.invalid || isLoading" class="btn btn-primary">
            @if (isLoading) {
              <div class="spinner"></div>
              <span>Création...</span>
            } @else {
              <span>Enregistrer le Portefeuille</span>
            }
          </button>
          <a routerLink="/admin/wallets" class="btn btn-secondary">Annuler</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-card {
      max-width: 800px;
      margin: 0 auto;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }

    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .input-with-action {
      display: flex;
      gap: 0.5rem;
    }

    .btn-input-action {
      padding: 0 1rem;
      white-space: nowrap;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  `]
})
export class WalletCreateComponent {
  private fb = inject(FormBuilder);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  createForm: FormGroup;
  isLoading = false;

  constructor() {
    this.createForm = this.fb.group({
      phoneNumber: ['', [Validators.required, phoneValidator()]],
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required],
      currency: ['XOF', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });
    this.generateCode();
  }

  generateCode() {
    // Generate code format: WLT-XXXXXXX where X is a random digit
    const rand = Math.floor(1000000 + Math.random() * 9000000);
    this.createForm.get('code')?.setValue(`WLT-${rand}`);
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isLoading = true;
    const formValue = this.createForm.value;

    this.walletApi.creerWallet(formValue).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success('Le portefeuille a été créé avec succès !');
        this.router.navigate(['/admin/wallets']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Erreur lors de la création du portefeuille.';
        this.toast.error(msg);
      }
    });
  }
}
