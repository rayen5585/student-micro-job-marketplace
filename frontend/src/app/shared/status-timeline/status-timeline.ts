import { Component, computed, input } from '@angular/core';
import { ProposalStatus } from '../../features/proposals/proposal.model';

type StepState = 'done' | 'current' | 'bad' | 'todo';
type Step = { label: string; state: StepState };

@Component({
  selector: 'app-status-timeline',
  template: `
    <ol class="tl">
      @for (s of steps(); track s.label) {
        <li [class.done]="s.state === 'done'" [class.current]="s.state === 'current'" [class.bad]="s.state === 'bad'">
          <span class="dot">{{ s.state === 'done' ? '✓' : s.state === 'bad' ? '✕' : $index + 1 }}</span>
          <span class="lbl">{{ s.label }}</span>
        </li>
      }
    </ol>
  `,
  styles: `
    .tl { list-style: none; display: flex; padding: 0; margin: 12px 0; }
    li { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative; font-size: 12px; color: var(--muted, #6b7280); }
    li:not(:last-child)::after {
      content: ''; position: absolute; top: 12px; left: calc(50% + 16px); width: calc(100% - 32px); height: 2px;
      background: var(--border, #e5e7eb);
    }
    li.done:not(:last-child)::after { background: #16a34a; }
    .dot {
      width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center;
      background: var(--border, #e5e7eb); color: var(--muted, #6b7280); font-weight: 700; font-size: 12px; z-index: 1;
    }
    li.done .dot { background: #16a34a; color: #fff; }
    li.current .dot { background: var(--primary, #4f46e5); color: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2); }
    li.bad .dot { background: #dc2626; color: #fff; }
    li.current .lbl, li.done .lbl, li.bad .lbl { color: var(--text, #1f2937); font-weight: 600; }
  `,
})
export class StatusTimeline {
  status = input.required<ProposalStatus>();

  steps = computed<Step[]>(() => {
    const st = this.status();

    if (st === 'Rejected') {
      const rejected: Step[] = [
        { label: 'Pending', state: 'done' },
        { label: 'Rejected', state: 'bad' },
      ];
      return rejected;
    }

    const order: ProposalStatus[] = ['Pending', 'Accepted', 'Completed'];
    const idx = order.indexOf(st);

    return order.map((label, i): Step => {
      let state: StepState = 'todo';
      if (i < idx) state = 'done';
      else if (i === idx) state = st === 'Completed' ? 'done' : 'current';
      return { label, state };
    });
  });
}