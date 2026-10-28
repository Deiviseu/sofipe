import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { API } from '../api-routes';
import { ApiResponse, LoginRequest, LoginResponse } from '../models/api.models';

const STORAGE_KEY = 'sofipe.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly session = signal<LoginResponse | null>(this.restore());
  readonly isLoggedIn = computed(() => this.session() !== null);

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(API.login, body).pipe(
      map((res) => res.data),
      tap((data) => {
        this.session.set(data);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }),
    );
  }

  logout(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.router.navigateByUrl('/login');
  }

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  private restore(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as LoginResponse;
      return this.isExpired(data.token) ? null : data;
    } catch {
      return null;
    }
  }

  /** O JWT da API dura 8h; descarta tokens vencidos ao recarregar a página. */
  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
