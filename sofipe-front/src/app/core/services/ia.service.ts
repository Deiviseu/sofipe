import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { API } from '../api-routes';
import { ApiResponse, Company, IaAnalysis, StoredAnalysis } from '../models/api.models';
import { environment } from '../../../environments/environment';
import { DEMO_ANALYSES } from '../demo/demo.interceptor';

const STORAGE_KEY = 'sofipe.analyses';

/**
 * Chama o agente de IA e guarda o resultado por empresa.
 *
 * PROVISÓRIO: a API ainda não salva a análise nem liga ao companyId,
 * então o histórico fica no localStorage do navegador. Quando existir
 * algo como POST /api/ia/analyze/{companyId} + GET do histórico,
 * troque só este serviço — as telas continuam iguais.
 */
@Injectable({ providedIn: 'root' })
export class IaService {
  private http = inject(HttpClient);

  readonly analyses = signal<Record<number, StoredAnalysis>>(this.restore());

  analyze(company: Company, interest: string): Observable<StoredAnalysis> {
    const body = { companyData: this.describe(company), interest };
    return this.http.post<ApiResponse<IaAnalysis>>(API.iaAnalysis, body).pipe(
      map((r) => ({
        ...r.data,
        companyId: company.companyId,
        interest,
        analyzedAt: new Date().toISOString(),
      })),
      tap((a) => {
        this.analyses.update((all) => ({ ...all, [a.companyId]: a }));
        this.persist();
      }),
    );
  }

  get(companyId: number): StoredAnalysis | undefined {
    return this.analyses()[companyId];
  }

  /** Monta o texto livre que a API espera em companyData. */
  private describe(c: Company): string {
    return [
      `Razão social: ${c.legalName}`,
      c.tradeName && `Nome fantasia: ${c.tradeName}`,
      `CNPJ: ${c.taxId}`,
      `CNAE: ${c.industryCode} - ${c.industryCodeDescription}`,
      `Porte: ${c.companySize}`,
      c.shareCapital != null && `Capital social: R$ ${c.shareCapital}`,
      `Abertura: ${c.openingDate}`,
      `Endereço: ${c.streetAdress}, ${c.number} - ${c.neighborhood}, ${c.city}/${c.state}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private restore(): Record<number, StoredAnalysis> {
    const fallback = environment.demo ? { ...DEMO_ANALYSES } : {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.analyses()));
    } catch {}
  }
}
