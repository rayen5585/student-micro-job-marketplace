import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocialService } from '../social.service';
import { ChatInfo } from '../proposal.model';

@Component({
  selector: 'app-proposal-chat',
  imports: [DatePipe],
  template: `
    <button class="back" (click)="back()">← Back</button>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (info(); as i) {
      <h2>💬 {{ i.proposal.jobTitle }}</h2>
      <p class="sub">Conversation with <b>{{ other() }}</b></p>

      <div class="box" #box>
        @for (m of i.messages; track m.id) {
          <div class="msg" [class.mine]="m.senderId === me">
            <span>{{ m.body }}</span>
            <small>{{ m.sender?.name }} · {{ m.createdAt | date: 'short' }}</small>
          </div>
        }
        @if (i.messages.length === 0) {
          <p class="empty">No messages yet. Say hello 👋</p>
        }
      </div>

      <div class="send">
        <textarea
          rows="2"
          placeholder="Write a message... (Enter = send, Shift+Enter = new line)"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
          (keydown.enter)="onEnter($event)"
        ></textarea>
        <button [disabled]="!draft().trim() || sending()" (click)="send()">Send</button>
      </div>
    }
  `,
  styles: `
    .back, .back:hover:not(:disabled) { background: none; color: var(--primary); padding: 0; margin-bottom: 12px; }
    .sub { color: var(--muted); margin-top: -8px; }
    .box {
      height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
      background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px;
    }
    .msg {
      max-width: 75%; padding: 8px 12px; border-radius: 12px; align-self: flex-start;
      background: rgba(127, 127, 127, 0.15); word-break: break-word; white-space: pre-wrap;
    }
    .msg.mine { align-self: flex-end; background: var(--primary); color: #fff; }
    .msg small { display: block; opacity: 0.7; font-size: 11px; margin-top: 2px; }
    .empty { margin: auto; color: var(--muted); }
    .send { display: flex; gap: 8px; margin-top: 12px; }
    .send textarea { flex: 1; resize: none; }
  `,
})
export class ProposalChat implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private social = inject(SocialService);
  private location = inject(Location);

  proposalId = Number(this.route.snapshot.paramMap.get('id'));
  me = Number(localStorage.getItem('userId'));

  info = signal<ChatInfo | null>(null);
  draft = signal('');
  sending = signal(false);
  error = signal('');
  box = viewChild<ElementRef<HTMLDivElement>>('box');
  private timer?: ReturnType<typeof setInterval>;
  private lastCount = 0;

  // esm el tarf el thani
  other = computed(() => {
    const p = this.info()?.proposal;
    if (!p) return '';
    return p.freelancer.id === this.me ? p.owner.name : p.freelancer.name;
  });

  ngOnInit() {
    this.load();
    this.timer = setInterval(() => this.load(), 5000); // nجibou les messages jdod kol 5 thawen
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  load() {
    this.social.chat(this.proposalId).subscribe({
      next: (data) => {
        this.error.set('');
        this.info.set(data);
        if (data.messages.length !== this.lastCount) {
          this.lastCount = data.messages.length;
          setTimeout(() => {
            const el = this.box()?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight; // nنزlou lel a5er
          });
        }
      },
      error: (err) => this.error.set(err.error?.message ?? 'Failed to load the conversation'),
    });
  }

  onEnter(e: Event) {
    const k = e as KeyboardEvent;
    if (k.shiftKey) return; // Shift+Enter = sattar jdid
    k.preventDefault();
    this.send();
  }

  send() {
    const body = this.draft().trim();
    if (!body || this.sending()) return;
    this.sending.set(true);
    this.social.sendMessage(this.proposalId, body).subscribe({
      next: () => {
        this.draft.set('');
        this.sending.set(false);
        this.load();
      },
      error: (err) => {
        this.sending.set(false);
        this.error.set(err.error?.message ?? 'Failed to send');
      },
    });
  }

  back() {
    this.location.back();
  }
}