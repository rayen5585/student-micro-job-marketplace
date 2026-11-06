import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BidSort, SearchParams, SearchResult } from './search.model';
import { Proposal } from '../proposals/proposal.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/search';

  search(params: SearchParams) {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.skills?.length) p = p.set('skills', params.skills.join(','));
    if (params.minBudget != null) p = p.set('minBudget', params.minBudget);
    if (params.maxBudget != null) p = p.set('maxBudget', params.maxBudget);
    if (params.urgent) p = p.set('urgent', 'true');
    if (params.sort) p = p.set('sort', params.sort);
    if (params.page) p = p.set('page', params.page);
    return this.http.get<SearchResult>(`${this.base}/jobs`, { params: p });
  }

  // bids mretbin (lel client), tنجem testa3mlou fi job-proposals
  sortedBids(jobId: number, sort: BidSort) {
    return this.http.get<(Proposal & { score?: number })[]>(`${this.base}/jobs/${jobId}/bids`, {
      params: { sort },
    });
  }
}