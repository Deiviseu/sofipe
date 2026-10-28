import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CompanyRequest } from '../models/api.models';

/** Resposta (parcial) da BrasilAPI — dados públicos da Receita Federal. */
interface BrasilApiCnpj {
  razao_social: string;
  nome_fantasia: string | null;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  porte: string | null;
  capital_social: number | null;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  data_inicio_atividade: string;
}

/**
 * Busca dados públicos do CNPJ na BrasilAPI (gratuita, sem chave, com CORS liberado).
 * Ideal no futuro: a própria API Spring fazer essa consulta e o front só chamar ela.
 */
@Injectable({ providedIn: 'root' })
export class CnpjService {
  private http = inject(HttpClient);

  lookup(cnpj: string): Observable<Partial<CompanyRequest>> {
    const digits = cnpj.replace(/\D/g, '');
    return this.http
      .get<BrasilApiCnpj>(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      .pipe(
        map((d) => ({
          taxId: digits,
          legalName: d.razao_social,
          tradeName: d.nome_fantasia ?? '',
          industryCode: String(d.cnae_fiscal ?? ''),
          industryCodeDescription: d.cnae_fiscal_descricao ?? '',
          companySize: d.porte ?? '',
          shareCapital: d.capital_social,
          streetAdress: d.logradouro ?? '',
          number: d.numero ?? '',
          additionalAdressInfo: d.complemento ?? '',
          neighborhood: d.bairro ?? '',
          city: d.municipio ?? '',
          state: d.uf ?? '',
          zipCode: (d.cep ?? '').replace(/\D/g, ''),
          openingDate: d.data_inicio_atividade ?? '',
        })),
      );
  }
}
