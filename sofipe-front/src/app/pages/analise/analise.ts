import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { IaService } from '../../core/services/ia.service';
import { Company, StoredAnalysis } from '../../core/models/api.models';
import { apiErrorMessage } from '../../core/interceptors/auth.interceptor';

const CIRC = 2 * Math.PI * 72;

@Component({
  selector: 'app-analise',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './analise.html',
  styleUrl: './analise.scss',
})
export class AnalisePage {
  private companies = inject(CompanyService);
  private ia = inject(IaService);
  private router = inject(Router);

  /** Vem da rota /empresas/:id/analise (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly company = signal<Company | null>(null);
  readonly loading = signal(true);
  readonly analyzing = signal(false);
  readonly error = signal<string | null>(null);
  readonly copied = signal(false);
  interest = '';

  readonly analysis = computed<StoredAnalysis | undefined>(
    () => this.ia.analyses()[Number(this.id())],
  );

  readonly dash = computed(() => {
    const score = Math.max(0, Math.min(100, this.analysis()?.numericScore ?? 0));
    return `${(score / 100) * CIRC} ${CIRC}`;
  });

  readonly whatsappLink = computed(() => `https://wa.me/?text=${encodeURIComponent(this.message())}`);

  constructor() {
    const nav = this.router.getCurrentNavigation()?.extras.state as
      | { interest?: string; autoRun?: boolean }
      | undefined;
    const autoRun = !!nav?.autoRun;
    if (nav?.interest) this.interest = nav.interest;

    // A API não tem GET por id: buscamos a lista e filtramos.
    this.companies.list().subscribe({
      next: (list) => {
        const found = list.find((c) => String(c.companyId) === this.id()) ?? null;
        this.company.set(found);
        this.loading.set(false);
        if (!found) this.error.set('Empresa não encontrada.');
        if (!this.interest) this.interest = this.analysis()?.interest ?? '';
        if (found && autoRun && this.interest) this.run();
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Não foi possível carregar a empresa.'));
        this.loading.set(false);
      },
    });
  }

  run(): void {
    const company = this.company();
    if (!company || !this.interest.trim()) return;
    this.analyzing.set(true);
    this.error.set(null);
    this.ia.analyze(company, this.interest.trim()).subscribe({
      next: () => this.analyzing.set(false),
      error: (err) => {
        this.error.set(
          apiErrorMessage(err, 'O agente de IA não respondeu. Verifique se o Ollama está no ar.'),
        );
        this.analyzing.set(false);
      },
    });
  }

  label(p?: string): string {
    return p === 'MEDIA' ? 'MÉDIA' : (p ?? '');
  }

  message(): string {
    const c = this.company();
    const a = this.analysis();
    if (!c || !a) return '';
    return [
      `Olá! Sou da Sofipe Seguros Corporativos.`,
      `Analisamos o perfil da ${c.tradeName || c.legalName} e acreditamos que podemos ajudar com: ${a.recommendedProducts.join(', ')}.`,
      `Podemos conversar rapidamente esta semana?`,
    ].join('\n\n');
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.message());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {}
  }
}
