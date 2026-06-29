import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Facture {
  id: number;
  reference: string;
  montant: number;
  dateFact: string;
  periode: string;
  statut: 'IMPAYEE' | 'PAYEE';
  unite: 'ISM' | 'WOYAFAL';
}

@Injectable({
  providedIn: 'root'
})
export class BillingApiService {
  private readonly BASE_EXTERNAL = '/api/external/factures';
  private readonly BASE_PAY = '/api/wallets';

  constructor(private http: HttpClient) {}

  getFacturesMoisCourant(walletCode: string, unite?: string): Observable<Facture[]> {
    let params = new HttpParams();
    if (unite) {
      params = params.set('unite', unite);
    }
    return this.http.get<Facture[]>(`${this.BASE_EXTERNAL}/${walletCode}/current`, { params });
  }

  getFacturesPeriode(walletCode: string, debut: string, fin: string): Observable<Facture[]> {
    const params = new HttpParams()
      .set('debut', debut)
      .set('fin', fin);
    return this.http.get<Facture[]>(`${this.BASE_EXTERNAL}/${walletCode}/periode`, { params });
  }

  payerFactureSimple(phoneNumber: string, serviceName: string, amount: number): Observable<string> {
    return this.http.post(`${this.BASE_PAY}/pay`, { phoneNumber, serviceName, amount }, { responseType: 'text' });
  }

  payerFacturesMultiples(phoneNumber: string, serviceName: string, factureReferences: string[]): Observable<string> {
    return this.http.post(`${this.BASE_PAY}/pay-factures`, { phoneNumber, serviceName, factureReferences }, { responseType: 'text' });
  }
}
