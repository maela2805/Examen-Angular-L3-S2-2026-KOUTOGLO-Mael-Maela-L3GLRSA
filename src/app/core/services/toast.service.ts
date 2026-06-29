import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const id = this.nextId++;
    this.toasts.update((current) => [...current, { id, message, type }]);

    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  dismiss(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
