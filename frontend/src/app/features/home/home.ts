import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Student Micro-Job Marketplace</h1>
      <p>Post small gigs, send your pitch, and let clients pick the best bid.</p>
      <div class="hero-actions">
        <a class="btn" routerLink="/jobs/new">+ Post a Job</a>
        <a class="btn outline" routerLink="/search">🔍 Browse Jobs</a>
      </div>
    </section>

    <div class="grid">
      <!-- ===== STUDENT 3 ===== -->
      <article class="panel">
        <span class="tag s3">Student 3</span>
        <h2>📨 Proposals</h2>
        <p class="sub">Pitch submission & bid management</p>

        <h4>Backend (Node/Express)</h4>
        <ul>
          <li>Proposal CRUD</li>
          <li>Status transition logic: <b>Pending → Accepted → Completed</b></li>
          <li>Auto-reject of other bids when one is accepted</li>
        </ul>

        <h4>Frontend (Angular)</h4>
        <ul>
          <li>Form to submit a pitch (with validation)</li>
          <li>Client UI to accept / reject bids</li>
        </ul>

        <div class="actions">
          <a class="btn" routerLink="/proposals/mine">My proposals</a>
        </div>

        <div class="quick">
          <label>
            Job ID
            <input type="number" min="1" [value]="jobId()" (input)="jobId.set($any($event.target).value)" />
          </label>
          <a class="btn outline" [routerLink]="['/proposals/new', jobId()]">Send a pitch</a>
          <a class="btn outline" [routerLink]="['/proposals/job', jobId()]">View bids (client)</a>
        </div>
      </article>

      <!-- ===== STUDENT 4 ===== -->
      <article class="panel">
        <span class="tag s4">Student 4</span>
        <h2>🔍 Search & Sorting</h2>
        <p class="sub">Find the right gig, fast</p>

        <h4>Backend (Node/Express)</h4>
        <ul>
          <li>Text-indexing search (MySQL FULLTEXT) on job descriptions</li>
          <li>Sorting algorithms for bids: <b>best value, lowest price, fastest</b></li>
        </ul>

        <h4>Frontend (Angular)</h4>
        <ul>
          <li>Faceted navigation: filter by skill tags</li>
          <li>Sort by <b>Highest paying</b> or <b>Urgent</b></li>
        </ul>

        <div class="actions">
          <a class="btn" routerLink="/search">Open search</a>
        </div>
      </article>
    </div>

    <section class="flow">
      <h3>How a gig works</h3>
      <div class="steps">
        <div class="step"><span>1</span>Client posts a job</div>
        <div class="arrow">→</div>
        <div class="step"><span>2</span>Freelancer sends a pitch <em class="pill pending">Pending</em></div>
        <div class="arrow">→</div>
        <div class="step"><span>3</span>Client accepts <em class="pill accepted">Accepted</em></div>
        <div class="arrow">→</div>
        <div class="step"><span>4</span>Work delivered <em class="pill completed">Completed</em></div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      text-align: center;
      padding: 32px 16px;
      background: #fff;
      border-radius: 16px;
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }
    .hero h1 { margin: 0 0 8px; color: var(--primary); }
    .hero p { margin: 0 0 16px; color: var(--muted); }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }

    .panel {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .panel h2 { margin: 12px 0 0; }
    .panel h4 { margin: 16px 0 4px; color: var(--muted); font-size: 13px; text-transform: uppercase; }
    .panel ul { margin: 0; padding-left: 20px; }
    .panel li { margin: 4px 0; }
    .sub { color: var(--muted); margin: 0; }

    .tag { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #fff; }
    .s3 { background: #4f46e5; }
    .s4 { background: #0891b2; }

    .actions { margin-top: 20px; }
    .quick {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed var(--border);
      display: flex;
      gap: 8px;
      align-items: end;
      flex-wrap: wrap;
    }
    .quick label { display: flex; flex-direction: column; font-size: 12px; color: var(--muted); }
    .quick input { width: 80px; }

    .btn {
      display: inline-block;
      background: var(--primary);
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
    }
    .btn:hover { background: var(--primary-dark); text-decoration: none; }
    .btn.outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
    .btn.outline:hover { background: #eef2ff; }

    .flow { margin-top: 32px; }
    .steps { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .step {
      flex: 1;
      min-width: 140px;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .step span {
      background: var(--primary);
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 700;
    }
    .arrow { font-size: 22px; color: var(--muted); }
    .pill { font-style: normal; font-size: 12px; padding: 2px 10px; border-radius: 999px; }
    .pending { background: #fff3cd; }
    .accepted { background: #d1e7dd; }
    .completed { background: #cfe2ff; }
  `,
})
export class Home {
  jobId = signal('1');
}