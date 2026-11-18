import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, JobInput } from './job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api/jobs';

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.api);
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.api}/${id}`);
  }

  createJob(job: JobInput): Observable<Job> {
    return this.http.post<Job>(this.api, job);
  }

  updateJob(id: number, job: JobInput): Observable<Job> {
    return this.http.put<Job>(`${this.api}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}