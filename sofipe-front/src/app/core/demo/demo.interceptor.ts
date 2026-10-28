import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { Company, CompanyRequest, IaAnalysis, StoredAnalysis } from '../models/api.models';

/**
 * MODO DEMONSTRAÇÃO — responde no lugar da API com dados fictícios.
 * Só é ativado no build "demo" (environment.demo = true).
 */

const now = new Date().toISOString();

function company(id: number, c: Partial<CompanyRequest>): Company {
  return {
    companyId: id,
    registrationStatus: 'ATIVA',
    createdAt: now,
    updatedAt: now,
    taxId: '',
    legalName: '',
    tradeName: '',
    industryCode: '',
    industryCodeDescription: '',
    companySize: '',
    shareCapital: null,
    streetAdress: '',
    number: '',
    additionalAdressInfo: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    openingDate: '2010-01-01',
    ...c,
  };
}

const companies: Company[] = [
  company(1, { taxId: '11111111000101', legalName: 'Metalúrgica Exemplo Ltda', tradeName: 'Exemplo Válvulas', industryCode: '2813500', industryCodeDescription: 'Fabricação de válvulas e registros', companySize: 'Médio', shareCapital: 2500000, city: 'Guarulhos' }),
  company(2, { taxId: '22222222000102', legalName: 'Transportes Modelo S.A.', industryCode: '4930202', industryCodeDescription: 'Transporte rodoviário de carga', companySize: 'Grande', shareCapital: 8000000, city: 'Barueri' }),
  company(3, { taxId: '33333333000103', legalName: 'Clínica Demonstração Ltda', industryCode: '8630503', industryCodeDescription: 'Atividade médica ambulatorial', companySize: 'Pequeno', shareCapital: 300000 }),
  company(4, { taxId: '44444444000104', legalName: 'Comércio Fictício ME', industryCode: '4789099', industryCodeDescription: 'Comércio varejista', companySize: 'Micro', shareCapital: 50000, city: 'Osasco' }),
  company(5, { taxId: '55555555000105', legalName: 'Serviços Teste Eireli', industryCode: '7020400', industryCodeDescription: 'Consultoria em gestão', companySize: 'Micro', shareCapital: 20000 }),
];

function analyze(c: Company, interest: string): IaAnalysis {
  const sizeScore: Record<string, number> = { Grande: 40, Médio: 32, Pequeno: 20, Micro: 10 };
  const capital = Math.min(25, Math.round(Math.log10((c.shareCapital ?? 10000) + 1) * 3.5));
  const industrial = /fabrica|transporte|metal|indústr|logíst/i.test(c.industryCodeDescription) ? 15 : 5;
  const urgency = /urgente|venc|sinistro|galp|frota|equipamento/i.test(interest) ? 15 : 7;
  const score = Math.min(98, (sizeScore[c.companySize] ?? 15) + capital + industrial + urgency);
  const priorityScore = score >= 70 ? 'ALTA' : score >= 45 ? 'MEDIA' : 'BAIXA';
  const desc = c.industryCodeDescription.toLowerCase();

  const products = /transporte/.test(desc)
    ? ['Seguro de frota', 'RCTR-C (carga)', 'Responsabilidade civil geral']
    : /médic|clínic/.test(desc)
      ? ['Responsabilidade civil profissional', 'Seguro empresarial', 'Plano de saúde empresarial']
      : /fabrica|metal/.test(desc)
        ? ['Seguro empresarial (patrimonial)', 'Responsabilidade civil geral', 'Quebra de máquinas', 'Lucros cessantes']
        : ['Seguro empresarial', 'Responsabilidade civil geral', 'Vida em grupo'];

  return {
    priorityScore,
    numericScore: score,
    scoreJustification: `Empresa de porte ${c.companySize.toLowerCase()} no setor de ${desc}, com capital social declarado e interesse "${interest}". ${
      priorityScore === 'ALTA'
        ? 'Combinação de patrimônio relevante e necessidade explícita indica ticket alto e boa chance de fechamento.'
        : priorityScore === 'MEDIA'
          ? 'Há potencial, mas o porte ou a urgência ainda pedem uma conversa para qualificar melhor.'
          : 'Ticket provavelmente baixo; vale nutrir o contato antes de investir tempo comercial.'
    }`,
    recommendedProducts: products,
    sugestionQuestions: [
      'Vocês já têm alguma apólice vigente? Quando vence?',
      'Qual o valor aproximado dos bens (imóvel, máquinas, estoque)?',
      'Já houve algum sinistro nos últimos 3 anos?',
      'Quem decide a contratação de seguros na empresa?',
    ],
    nextStep:
      priorityScore === 'ALTA'
        ? 'Agendar visita técnica nesta semana.'
        : priorityScore === 'MEDIA'
          ? 'Ligar para o responsável e levantar apólices atuais.'
          : 'Enviar material institucional e retomar em 30 dias.',
  };
}

/** Análises pré-carregadas para o painel não começar vazio. */
export const DEMO_ANALYSES: Record<number, StoredAnalysis> = Object.fromEntries(
  [
    [1, 'Proteção do galpão e dos equipamentos; avaliar responsabilidade civil.'],
    [2, 'Renovação do seguro da frota, vence mês que vem.'],
    [3, 'Cobertura para erro médico.'],
    [4, 'Seguro da loja.'],
  ].map(([id, interest]) => {
    const c = companies.find((x) => x.companyId === id)!;
    return [id, { ...analyze(c, interest as string), companyId: id as number, interest: interest as string, analyzedAt: now }];
  }),
);

const ok = <T>(body: T, ms = 300) =>
  of(new HttpResponse({ status: 200, body: { success: true, data: body, error: null, timestamp: new Date().toISOString(), path: '', status: 200 } })).pipe(delay(ms));

// JWT falso com expiração em 2100, só para o AuthService aceitar.
const fakeToken = `demo.${btoa(JSON.stringify({ exp: 4102444800, profile: 'ADMIN' }))}.demo`;

export const demoInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  if (url.endsWith('/api/auth/login')) {
    const body = req.body as { email: string };
    const name = body.email.split('@')[0].replace(/[._]/g, ' ');
    return ok({ token: fakeToken, tokenType: 'Bearer', name: name.charAt(0).toUpperCase() + name.slice(1), email: body.email, profile: 'ADMIN' }, 500);
  }

  if (url.endsWith('/api/company/list')) return ok([...companies]);

  if (url.endsWith('/api/company/register')) {
    const c = company(Math.max(...companies.map((x) => x.companyId)) + 1, req.body as CompanyRequest);
    companies.push(c);
    return ok(c, 500);
  }

  if (url.endsWith('/api/ia/test-analysis')) {
    const body = req.body as { companyData: string; interest: string };
    const taxId = /CNPJ: (\d+)/.exec(body.companyData)?.[1];
    const c = companies.find((x) => x.taxId === taxId) ?? companies[0];
    return ok(analyze(c, body.interest), 1800);
  }

  if (url.includes('brasilapi.com.br/api/cnpj')) {
    const digits = url.split('/').pop() ?? '';
    return of(
      new HttpResponse({
        status: 200,
        body: {
          razao_social: 'Indústria Demonstração de Plásticos Ltda',
          nome_fantasia: 'Demo Plásticos',
          cnae_fiscal: 2222600,
          cnae_fiscal_descricao: 'Fabricação de embalagens de material plástico',
          porte: 'Médio',
          capital_social: 1500000,
          logradouro: 'Rua Exemplo',
          numero: '100',
          complemento: 'Galpão 2',
          bairro: 'Distrito Industrial',
          municipio: 'Jundiaí',
          uf: 'SP',
          cep: '13200000',
          data_inicio_atividade: '2012-05-10',
          cnpj: digits,
        },
      }),
    ).pipe(delay(700));
  }

  return next(req);
};
