import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { apiErrorMessage } from '../../core/interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly demo = environment.demo;
  readonly loading = signal(false);
  readonly error = signal<string | null>(this.auth.logoutReason());

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/painel'),
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'E-mail ou senha inválidos.'));
        this.loading.set(false);
      },
    });
  }
}
