import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateProposalDto, Proposal, ProposalStatus } from './proposal.model';

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/proposals';

  create(dto: CreateProposalDto) {
    return this.http.post<Proposal>(this.base, dto);
  }

  listForJob(jobId: string | number) {
    return this.http.get<Proposal[]>(`${this.base}/job/${jobId}`);
  }

  listMine() {
    return this.http.get<Proposal[]>(`${this.base}/me`);
  }

  withdraw(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  changeStatus(id: number, status: ProposalStatus) {
    return this.http.patch<Proposal>(`${this.base}/${id}/status`, { status });
  }
}