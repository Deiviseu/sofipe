import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { environment } from '../environments/environment';
import { demoInterceptor } from './core/demo/demo.interceptor';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    environment.demo
      ? provideRouter(routes, withComponentInputBinding(), withHashLocation())
      : provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors(environment.demo ? [authInterceptor, demoInterceptor] : [authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
