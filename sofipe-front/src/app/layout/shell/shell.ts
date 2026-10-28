import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <nav class="sidebar" aria-label="Menu principal">
        <a routerLink="/painel" class="brand">
          <svg width="28" height="28" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="12" cy="24" r="8" fill="#00638A" />
            <circle cx="24" cy="10" r="6" fill="#FFBF00" />
          </svg>
          <span>Sofipe</span>
        </a>
        <div class="links">
          <a routerLink="/painel" routerLinkActive="active">Painel de leads</a>
          <a routerLink="/empresas/nova" routerLinkActive="active">Nova empresa</a>
        </div>
        <div class="user">
          <span>{{ auth.session()?.name }}</span>
          <span class="muted">{{ auth.session()?.profile }}</span>
          <button type="button" class="btn btn-outline" (click)="auth.logout()">Sair</button>
        </div>
      </nav>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .layout { min-height: 100vh; display: flex; flex-wrap: wrap; }
    .sidebar {
      flex: 1 1 220px; max-width: 100%; background: var(--surface);
      padding: 28px 20px; display: flex; flex-direction: column; gap: 32px;
    }
    .brand {
      display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text);
      font-family: var(--font-title); font-weight: 700; font-size: 20px;
    }
    .links { display: flex; flex-direction: column; gap: 4px; }
    .links a {
      display: flex; align-items: center; min-height: 44px; padding: 0 14px;
      border-radius: var(--radius); color: var(--text); text-decoration: none;
      &:hover { color: var(--accent); }
      &.active { background: var(--card); color: var(--accent); font-weight: 500; }
    }
    .user { margin-top: auto; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    .user .btn { margin-top: 12px; }
    .content { flex: 999 1 560px; min-width: 0; padding: 40px; }
    @media (max-width: 800px) {
      .sidebar { gap: 16px; }
      .user { margin-top: 0; }
      .content { padding: 24px 16px; }
    }
  `,
})
export class Shell {
  protected auth = inject(AuthService);
}
