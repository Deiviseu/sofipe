import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { IaService } from '../../core/services/ia.service';
import { Company, Priority, StoredAnalysis } from '../../core/models/api.models';
import { apiErrorMessage } from '../../core/interceptors/auth.interceptor';

type Filter = 'TODOS' | Priority;

interface Row {
  company: Company;
  analysis?: StoredAnalysis;
}

const ORDER: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage {
  private companies = inject(CompanyService);
  private ia = inject(IaService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly list = signal<Company[]>([]);
  readonly filter = signal<Filter>('TODOS');
  readonly search = signal('');

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'BAIXA', label: 'Baixa' },
  ];

  readonly rows = computed<Row[]>(() => {
    const analyses = this.ia.analyses();
    return this.list()
      .map((company) => ({ company, analysis: analyses[company.companyId] }))
      .sort(
        (a, b) =>
          (ORDER[a.analysis?.priorityScore ?? ''] ?? 3) -
            (ORDER[b.analysis?.priorityScore ?? ''] ?? 3) ||
          (b.analysis?.numericScore ?? 0) - (a.analysis?.numericScore ?? 0),
      );
  });

  readonly visible = computed(() => {
    const f = this.filter();
    const q = this.search().trim().toLowerCase();
    return this.rows().filter(
      (r) =>
        (f === 'TODOS' || r.analysis?.priorityScore === f) &&
        (!q ||
          r.company.legalName.toLowerCase().includes(q) ||
          (r.company.tradeName ?? '').toLowerCase().includes(q) ||
          r.company.taxId.includes(q.replace(/\D/g, ''))),
    );
  });

  readonly stats = computed(() => {
    const rows = this.rows();
    const count = (p: Priority) => rows.filter((r) => r.analysis?.priorityScore === p).length;
    return {
      total: rows.length,
      alta: count('ALTA'),
      media: count('MEDIA'),
      pendentes: rows.filter((r) => !r.analysis).length,
    };
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.companies.list().subscribe({
      next: (data) => {
        this.list.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Não foi possível carregar as empresas.'));
        this.loading.set(false);
      },
    });
  }

  label(p?: Priority): string {
    return p === 'MEDIA' ? 'MÉDIA' : (p ?? 'Sem análise');
  }
}
