import { environment } from '../../environments/environment';

const base = environment.apiUrl;

/**
 * Todas as rotas da API num lugar só.
 * CONFIRA no Swagger (/swagger-ui/index.html) os prefixos de usuários e empresas —
 * login e IA já estão confirmados.
 */
export const API = {
  login: `${base}/api/auth/login`,

  usersRegister: `${base}/api/users/register`,
  usersList: `${base}/api/users/list`,
  usersUpdate: (id: number) => `${base}/api/users/update/${id}`,
  usersDelete: (id: number) => `${base}/api/users/delete/${id}`,

  companyRegister: `${base}/api/company/register`,
  companyList: `${base}/api/company/list`,
  companyUpdate: (id: number) => `${base}/api/company/update/${id}`,

  iaAnalysis: `${base}/api/ia/test-analysis`,
};
