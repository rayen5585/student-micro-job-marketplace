import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateJobDto, Job } from './job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/jobs';

  list() {
    return this.http.get<Job[]>(this.base);
  }

  getOne(id: number) {
    return this.http.get<Job>(`${this.base}/${id}`);
  }

  create(dto: CreateJobDto) {
    return this.http.post<Job>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateJobDto>) {
    return this.http.put<Job>(`${this.base}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
