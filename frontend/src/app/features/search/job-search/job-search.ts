import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchService } from '../search.service';
import { JobSort, SearchResult } from '../search.model';

@Component({
  selector: 'app-job-search',
  imports: [DatePipe, RouterLink],
  template: `
    <h2>Find a gig</h2>

    <div class="topbar">
      <input
        class="search"
        type="search"
        placeholder="Search jobs (ex: logo, tutor, angular...)"
        [value]="q()"
        (input)="onQuery($any($event.target).value)"
      />

      <label>
        Sort by
        <select (change)="setSort($any($event.target).value)">
          <option value="relevance" [selected]="sort() === 'relevance'">Best match</option>
          <option value="newest" [selected]="sort() === 'newest'">Newest</option>
          <option value="highest_paying" [selected]="sort() === 'highest_paying'">Highest paying</option>
          <option value="urgent" [selected]="sort() === 'urgent'">Urgent</option>
        </select>
      </label>
    </div>

    <div class="layout">
      <!-- ===== Faceted navigation ===== -->
      <aside class="filters">
        <h3>Filters</h3>

        <label class="check">
          <input type="checkbox" [checked]="urgentOnly()" (change)="toggleUrgent()" />
          Urgent only (≤ 3 days)
        </label>

        <h4>Budget (TND)</h4>
        <div class="budget">
          <input type="number" min="0" placeholder="Min" [value]="minBudget() ?? ''"
                 (change)="setMin($any($event.target).value)" />
          <input type="number" min="0" placeholder="Max" [value]="maxBudget() ?? ''"
                 (change)="setMax($any($event.target).value)" />
        </div>

        <h4>Skills</h4>
        @if (facets().length === 0) {
          <small>No skills found.</small>
        }
        @for (f of facets(); track f.name) {
          <label class="check">
            <input type="checkbox" [checked]="selectedSkills().includes(f.name)" (change)="toggleSkill(f.name)" />
            {{ f.name }} <span class="count">({{ f.count }})</span>
          </label>
        }

        <button class="link" (click)="clearFilters()">Clear all filters</button>
      </aside>

      <!-- ===== Résultats ===== -->
      <section class="results">
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        @if (loading()) {
          <p>Loading...</p>
        }

        <p class="total">{{ result()?.total ?? 0 }} job(s) found</p>

        @for (j of jobs(); track j.id) {
          <article class="card">
            <header>
              <strong>{{ j.title }}</strong>
              <span class="budget-tag">{{ j.budget }} TND</span>
            </header>

            <p>{{ j.description }}</p>

            <div class="tags">
              @for (s of j.skills; track s) {
                <span class="chip">{{ s }}</span>
              }
              @if (j.isUrgent) {
                <span class="chip urgent">🔥 Urgent</span>
              }
            </div>

            <footer>
              @if (j.deadline) {
                <small>Deadline: {{ j.deadline | date: 'mediumDate' }}</small>
              } @else {
                <small>No deadline</small>
              }
              <a [routerLink]="['/proposals/new', j.id]">Send a proposal</a>
            </footer>
          </article>
        }

        @if (!loading() && jobs().length === 0) {
          <p>No jobs match your search.</p>
        }

        @if ((result()?.pages ?? 1) > 1) {
          <div class="pager">
            <button [disabled]="page() <= 1" (click)="goTo(page() - 1)">← Prev</button>
            <span>Page {{ page() }} / {{ result()?.pages }}</span>
            <button [disabled]="page() >= (result()?.pages ?? 1)" (click)="goTo(page() + 1)">Next →</button>
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    .topbar { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .search { flex: 1; min-width: 220px; padding: 8px 12px; font-size: 16px; }
    .layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }
    .filters { border: 1px solid #ddd; border-radius: 8px; padding: 12px; align-self: start; }
    .filters h4 { margin: 16px 0 6px; }
    .check { display: flex; gap: 6px; align-items: center; margin: 4px 0; }
    .count { color: #777; font-size: 13px; }
    .budget { display: flex; gap: 8px; }
    .budget input { width: 80px; }
    .link { margin-top: 16px; background: none; border: none; color: #1565c0; cursor: pointer; padding: 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .card header { display: flex; justify-content: space-between; }
    .budget-tag { font-weight: 700; color: #2e7d32; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
    .chip { background: #eee; border-radius: 12px; padding: 2px 10px; font-size: 12px; }
    .chip.urgent { background: #ffe0b2; }
    footer { display: flex; justify-content: space-between; align-items: center; }
    .pager { display: flex; gap: 12px; align-items: center; justify-content: center; margin-top: 16px; }
    .error { color: #c62828; }
  `,
})
export class JobSearch implements OnInit {
  private service = inject(SearchService);

  // ===== état des filtres =====
  q = signal('');
  sort = signal<JobSort>('relevance');
  selectedSkills = signal<string[]>([]);
  minBudget = signal<number | null>(null);
  maxBudget = signal<number | null>(null);
  urgentOnly = signal(false);
  page = signal(1);

  // ===== état de la réponse =====
  result = signal<SearchResult | null>(null);
  loading = signal(false);
  error = signal('');

  jobs = computed(() => this.result()?.jobs ?? []);
  facets = computed(() => this.result()?.facets ?? []);

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.service
      .search({
        q: this.q(),
        skills: this.selectedSkills(),
        minBudget: this.minBudget(),
        maxBudget: this.maxBudget(),
        urgent: this.urgentOnly(),
        sort: this.sort(),
        page: this.page(),
      })
      .subscribe({
        next: (r) => {
          this.result.set(r);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Failed to load jobs');
        },
      });
  }

  // yرجa3 lel page 1 w ya3mel recherche jdida
  private refresh() {
    this.page.set(1);
    this.load();
  }

  // debounce: ma ybaath requête ken ba3d 300ms men a5er 7arf
  onQuery(value: string) {
    this.q.set(value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refresh(), 300);
  }

  setSort(value: JobSort) {
    this.sort.set(value);
    this.refresh();
  }

  toggleSkill(name: string) {
    this.selectedSkills.update((list) =>
      list.includes(name) ? list.filter((s) => s !== name) : [...list, name]
    );
    this.refresh();
  }

  toggleUrgent() {
    this.urgentOnly.update((v) => !v);
    this.refresh();
  }

  setMin(value: string) {
    this.minBudget.set(value === '' ? null : Number(value));
    this.refresh();
  }

  setMax(value: string) {
    this.maxBudget.set(value === '' ? null : Number(value));
    this.refresh();
  }

  clearFilters() {
    this.q.set('');
    this.selectedSkills.set([]);
    this.minBudget.set(null);
    this.maxBudget.set(null);
    this.urgentOnly.set(false);
    this.sort.set('relevance');
    this.refresh();
  }

  goTo(page: number) {
    this.page.set(page);
    this.load();
  }
}