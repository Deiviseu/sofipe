/** Envelope padrão de todas as respostas da API. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string; details?: unknown } | null;
  timestamp: string;
  path: string;
  status: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  name: string;
  email: string;
  profile: string;
}

/** Campos como estão na API (incluindo os typos streetAdress / additionalAdressInfo). */
export interface CompanyRequest {
  taxId: string;
  legalName: string;
  tradeName: string;
  industryCode: string;
  industryCodeDescription: string;
  companySize: string;
  shareCapital: number | null;
  streetAdress: string;
  number: string;
  additionalAdressInfo: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  openingDate: string;
}

export interface Company extends CompanyRequest {
  companyId: number;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface IaAnalysisRequest {
  companyData: string;
  interest: string;
}

export interface IaAnalysis {
  priorityScore: Priority;
  numericScore: number;
  scoreJustification: string;
  recommendedProducts: string[];
  sugestionQuestions: string[];
  nextStep: string;
}

/** Análise guardada no front enquanto a API não persiste (ligada à empresa). */
export interface StoredAnalysis extends IaAnalysis {
  companyId: number;
  interest: string;
  analyzedAt: string;
}
