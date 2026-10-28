# Sofipe Prospect IA — Front-end (Angular 20)

Webapp do desafio ENIAC 22743: login, painel de leads, cadastro de empresa por CNPJ e qualificação com o agente de IA da API Sofipe.

## Rodar

```bash
npm install
npm start          # http://localhost:4200
```

Em desenvolvimento, `proxy.conf.json` manda tudo que começa com `/api` para `https://sofipe.arbru.com.br`,
então o navegador não esbarra em CORS. Para apontar para a API local, troque o `target` para `http://localhost:8080`.

## Estrutura

```
src/app/
  core/
    api-routes.ts          # TODAS as URLs da API (confira no Swagger)
    models/api.models.ts   # tipos dos DTOs + envelope {success, data, error}
    services/
      auth.service.ts      # login, sessão (sessionStorage), logout, expiração do JWT
      company.service.ts   # /company/register, /list, /update
      ia.service.ts        # /ia/test-analysis + histórico (provisório no localStorage)
      cnpj.service.ts      # BrasilAPI para preencher dados pelo CNPJ
    interceptors/auth.interceptor.ts  # Bearer em toda chamada; 401 -> logout
    guards/auth.guard.ts              # bloqueia rotas sem login
  layout/shell/            # menu lateral + área de conteúdo
  pages/
    login/                 # /login
    dashboard/             # /painel
    empresa-form/          # /empresas/nova
    analise/               # /empresas/:id/analise
```

Standalone components, signals, zoneless, lazy loading por rota, novo control flow (`@if`, `@for`).

## Pendências que dependem da API

- **Rotas de usuários e empresas**: os prefixos `/api/users` e `/api/company` em `api-routes.ts` são suposição — confirmar no Swagger.
- **CORS** na API antes do deploy (o proxy só resolve em desenvolvimento).
- **Persistir a análise ligada ao `companyId`**: hoje o `IaService` guarda no localStorage. Quando houver endpoint, trocar só esse serviço.
- **GET de empresa por id**: a tela de análise busca a lista inteira e filtra.
- **Envio ao CRM**: botão já existe, desabilitado.
