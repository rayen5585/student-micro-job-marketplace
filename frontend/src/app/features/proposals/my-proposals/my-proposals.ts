import { Component, inject, signal, OnInit } from '@angular/core';
import { ProposalService } from '../proposal.service';
import { Proposal } from '../proposal.model';

@Component({
  selector: 'app-my-proposals',
  template: `
    <h2>My proposals</h2>

    @if (proposals().length === 0) {
      <p>You haven't bid on anything yet.</p>
    }

    @for (p of proposals(); track p.id) {
      <article class="card">
        <strong>{{ p.job?.title }}</strong>
        <span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span>
        <p>{{ p.price }} TND • {{ p.deliveryDays }} day(s)</p>

        @if (p.status === 'Pending') {
          <button (click)="withdraw(p.id)">Withdraw</button>
        }
      </article>
    }
  `,
  styles: `
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .badge { margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #eee; }
    .pending { background: #fff3cd; }
    .accepted { background: #d1e7dd; }
    .rejected { background: #f8d7da; }
    .completed { background: #cfe2ff; }
  `,
})
export class MyProposals implements OnInit {
  private service = inject(ProposalService);
  proposals = signal<Proposal[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.listMine().subscribe((data) => this.proposals.set(data));
  }

  withdraw(id: number) {
    this.service.withdraw(id).subscribe(() => this.load());
  }
}