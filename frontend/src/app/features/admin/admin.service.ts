import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Proposal } from '../proposals/proposal.model';
import { AdminJob, AdminStats, AdminUser } from './admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/admin';

  me() { return this.http.get<AdminUser>(`${this.base}/me`); }
  stats() { return this.http.get<AdminStats>(`${this.base}/stats`); }

  users() { return this.http.get<AdminUser[]>(`${this.base}/users`); }
  setRole(id: number, role: 'user' | 'admin') {
    return this.http.patch<AdminUser>(`${this.base}/users/${id}/role`, { role });
  }
  deleteUser(id: number) { return this.http.delete<void>(`${this.base}/users/${id}`); }

  jobs() { return this.http.get<AdminJob[]>(`${this.base}/jobs`); }
  deleteJob(id: number) { return this.http.delete<void>(`${this.base}/jobs/${id}`); }

  proposals(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Proposal[]>(`${this.base}/proposals`, { params });
  }
  deleteProposal(id: number) { return this.http.delete<void>(`${this.base}/proposals/${id}`); }
}