import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletStore } from '../../../core/store/wallet.store';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glass-card login-card">
        <div class="login-header">
          <div class="logo-large">BW</div>
          <h2>Connexion BadWallet</h2>
          <p>Choisissez votre profil pour accéder à votre espace</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label">Rôle / Profil</label>
            <select formControlName="role" class="form-control" (change)="onRoleChange()">
              <option value="CLIENT">Client (Self-Service)</option>
              <option value="AGENT">Agent de Guichet (Administration)</option>
            </select>
          </div>

          @if (isClient()) {
            <div class="form-group">
              <label class="form-label">Numéro de téléphone</label>
              <input 
                type="text" 
                formControlName="phoneNumber" 
                class="form-control" 
                placeholder="Ex: +221770000003"
                autocomplete="tel"
              />
              @if (loginForm.get('phoneNumber')?.touched && loginForm.get('phoneNumber')?.errors?.['required']) {
                <span class="error-msg">Le numéro de téléphone est obligatoire</span>
              }
            </div>
          } @else {
            <div class="form-group">
              <label class="form-label">Mot de passe Agent</label>
              <input 
                type="password" 
                formControlName="password" 
                class="form-control" 
                placeholder="Entrez votre code d'accès"
                autocomplete="current-password"
              />
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']) {
                <span class="error-msg">Le mot de passe est obligatoire</span>
              }
            </div>
          }

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn btn-primary btn-block btn-login-submit">
            @if (isLoading) {
              <div class="spinner"></div>
              <span>Vérification...</span>
            } @else {
              <span>Se connecter</span>
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 10% 20%, rgb(19, 26, 44) 0%, rgb(11, 15, 25) 90.1%);
      padding: 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      padding: 3rem 2.5rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo-large {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    .login-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      font-weight: 800;
    }

    .login-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .btn-block {
      width: 100%;
    }

    .btn-login-submit {
      margin-top: 1rem;
      height: 50px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(WalletStore);
  private walletApi = inject(WalletApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      role: ['CLIENT', Validators.required],
      phoneNumber: ['+221770000003', Validators.required],
      password: ['']
    });
  }

  isClient(): boolean {
    return this.loginForm.get('role')?.value === 'CLIENT';
  }

  onRoleChange() {
    const role = this.loginForm.get('role')?.value;
    if (role === 'CLIENT') {
      this.loginForm.get('phoneNumber')?.setValidators(Validators.required);
      this.loginForm.get('password')?.clearValidators();
      this.loginForm.get('password')?.setValue('');
    } else {
      this.loginForm.get('password')?.setValidators(Validators.required);
      this.loginForm.get('phoneNumber')?.clearValidators();
      this.loginForm.get('phoneNumber')?.setValue('');
    }
    this.loginForm.get('phoneNumber')?.updateValueAndValidity();
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { role, phoneNumber, password } = this.loginForm.value;

    if (role === 'AGENT') {
      if (password === 'agent2026' || password === 'admin123') {
        setTimeout(() => {
          this.isLoading = false;
          this.store.setRole('AGENT');
          this.toast.success('Connexion Agent réussie !');
          this.router.navigate(['/admin/wallets']);
        }, 800); 
      } else {
        this.isLoading = false;
        this.toast.error('Mot de passe Agent incorrect');
      }
    } else {
      this.walletApi.consulterWallet(phoneNumber).subscribe({
        next: (wallet) => {
          this.isLoading = false;
          this.store.setRole('CLIENT');
          this.store.setClientPhone(phoneNumber);
          this.toast.success(`Bienvenue dans votre espace BadWallet !`);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(`Aucun portefeuille trouvé pour le numéro : ${phoneNumber}`);
        }
      });
    }
  }
}
