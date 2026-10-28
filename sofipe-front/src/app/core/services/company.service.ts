import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API } from '../api-routes';
import { ApiResponse, Company, CompanyRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);

  list(): Observable<Company[]> {
    return this.http.get<ApiResponse<Company[]>>(API.companyList).pipe(map((r) => r.data ?? []));
  }

  register(body: CompanyRequest): Observable<Company> {
    return this.http.post<ApiResponse<Company>>(API.companyRegister, body).pipe(map((r) => r.data));
  }

  update(id: number, body: CompanyRequest): Observable<Company> {
    return this.http.put<ApiResponse<Company>>(API.companyUpdate(id), body).pipe(map((r) => r.data));
  }
}
