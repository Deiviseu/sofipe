import { HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { CnpjService } from '../../core/services/cnpj.service';
import { CompanyRequest } from '../../core/models/api.models';
import { apiErrorMessage } from '../../core/interceptors/auth.interceptor';

interface FieldDef {
  key: keyof CompanyRequest;
  label: string;
  type?: string;
}

@Component({
  selector: 'app-empresa-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './empresa-form.html',
  styleUrl: './empresa-form.scss',
})
export class EmpresaFormPage {
  private fb = inject(NonNullableFormBuilder);
  private companies = inject(CompanyService);
  private cnpj = inject(CnpjService);
  private router = inject(Router);

  readonly lookingUp = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  readonly form = this.fb.group({
    taxId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    legalName: ['', Validators.required],
    tradeName: [''],
    industryCode: ['', [Validators.required, Validators.maxLength(7)]],
    industryCodeDescription: [''],
    companySize: [''],
    shareCapital: this.fb.control<number | null>(null),
    openingDate: [''],
    zipCode: [''],
    streetAdress: [''],
    number: [''],
    additionalAdressInfo: [''],
    neighborhood: [''],
    city: [''],
    state: ['', Validators.maxLength(2)],
  });

  readonly interest = this.fb.control('', Validators.required);

  readonly dadosFields: FieldDef[] = [
    { key: 'legalName', label: 'Razão social' },
    { key: 'tradeName', label: 'Nome fantasia' },
    { key: 'industryCode', label: 'CNAE' },
    { key: 'industryCodeDescription', label: 'Descrição do CNAE' },
    { key: 'companySize', label: 'Porte' },
    { key: 'shareCapital', label: 'Capital social (R$)', type: 'number' },
    { key: 'openingDate', label: 'Data de abertura', type: 'date' },
  ];

  readonly enderecoFields: FieldDef[] = [
    { key: 'zipCode', label: 'CEP' },
    { key: 'streetAdress', label: 'Logradouro' },
    { key: 'number', label: 'Número' },
    { key: 'additionalAdressInfo', label: 'Complemento' },
    { key: 'neighborhood', label: 'Bairro' },
    { key: 'city', label: 'Cidade' },
    { key: 'state', label: 'UF' },
  ];

  onCnpjInput(value: string): void {
    this.form.controls.taxId.setValue(value.replace(/\D/g, '').slice(0, 14));
  }

  lookup(): void {
    const taxId = this.form.controls.taxId.value;
    if (taxId.length !== 14) {
      this.form.controls.taxId.markAsTouched();
      return;
    }
    this.lookingUp.set(true);
    this.error.set(null);
    this.info.set(null);
    this.cnpj.lookup(taxId).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.info.set('Dados preenchidos a partir da Receita Federal. Revise antes de salvar.');
        this.lookingUp.set(false);
      },
      error: () => {
        this.error.set('CNPJ não encontrado. Preencha os dados manualmente.');
        this.lookingUp.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.interest.invalid) {
      this.form.markAllAsTouched();
      this.interest.markAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.companies.register(this.form.getRawValue()).subscribe({
      next: (company) => {
        const state = { interest: this.interest.value, autoRun: true };
        if (company?.companyId) {
          this.router.navigate(['/empresas', company.companyId, 'analise'], { state });
        } else {
          this.router.navigateByUrl('/painel');
        }
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Não foi possível salvar a empresa.'));
        this.saving.set(false);
      },
    });
  }

  invalid(key: keyof CompanyRequest): boolean {
    const c = this.form.controls[key];
    return c.touched && c.invalid;
  }
}
