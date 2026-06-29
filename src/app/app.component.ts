import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/layout/header/header.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { WalletStore } from './core/store/wallet.store';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styles: [`
    .toast-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1.25rem;
      font-weight: 700;
      padding: 0 0.5rem;
      transition: color 0.2s ease;
    }
    
    .toast-close-btn:hover {
      color: var(--text-primary);
    }
    
    .toast-content {
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
    }
  `]
})
export class AppComponent {
  readonly store = inject(WalletStore);
  readonly toastService = inject(ToastService);
}
