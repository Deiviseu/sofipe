import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Coloca o Bearer em toda chamada e desloga se a API responder 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'não autorizado';
        console.error('[401]', req.method, req.url, err.error);
        auth.logout(`A API recusou ${req.method} ${req.url.replace(/^https?:\/\/[^/]+/, '')} (401: ${msg}).`);
      }
      return throwError(() => err);
    }),
  );
};

/** Extrai a mensagem do envelope de erro da API. */
export function apiErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente de novo.'): string {
  if (err instanceof Error && !(err instanceof HttpErrorResponse)) return err.message;
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Não foi possível falar com a API (offline ou bloqueada por CORS).';
    return err.error?.error?.message ?? err.error?.message ?? fallback;
  }
  return fallback;
}
