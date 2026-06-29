import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Wallet {
  id?: number;
  phoneNumber: string;
  email: string;
  code: string;
  currency: string;
  balance: number;
  createdAt?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id?: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
  amount: number;
  fees: number;
  netAmount: number;
  description: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletApiService {
  private readonly BASE_URL = '/api/wallets';

  constructor(private http: HttpClient) {}

  creerWallet(wallet: Wallet): Observable<Wallet> {
    return this.http.post<Wallet>(this.BASE_URL, wallet);
  }

  listerWallets(page: number = 0, size: number = 10): Observable<Page<Wallet>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Wallet>>(this.BASE_URL, { params });
  }

  consulterWallet(phoneNumber: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.BASE_URL}/${encodeURIComponent(phoneNumber)}`);
  }

  consulterSolde(phoneNumber: string): Observable<{ phoneNumber: string; balance: number }> {
    return this.http.get<{ phoneNumber: string; balance: number }>(`${this.BASE_URL}/${encodeURIComponent(phoneNumber)}/balance`);
  }

  effectuerDepot(id: number, amount: number, paymentMethod: string): Observable<string> {
    return this.http.post(`${this.BASE_URL}/${id}/deposit`, { amount, paymentMethod }, { responseType: 'text' });
  }

  effectuerRetrait(phoneNumber: string, amount: number): Observable<string> {
    return this.http.post(`${this.BASE_URL}/withdraw`, { phoneNumber, amount }, { responseType: 'text' });
  }

  effectuerTransfert(senderPhone: string, receiverPhone: string, amount: number): Observable<string> {
    return this.http.post(`${this.BASE_URL}/transfer`, { senderPhone, receiverPhone, amount }, { responseType: 'text' });
  }

  listerTransactions(phoneNumber: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.BASE_URL}/${encodeURIComponent(phoneNumber)}/transactions`);
  }

  seeder(numWallets: number, eventsPerWallet: number): Observable<string> {
    const params = new HttpParams()
      .set('numWallets', numWallets.toString())
      .set('eventsPerWallet', eventsPerWallet.toString());
    return this.http.post(`${this.BASE_URL}/seed`, null, { params, responseType: 'text' });
  }
}
