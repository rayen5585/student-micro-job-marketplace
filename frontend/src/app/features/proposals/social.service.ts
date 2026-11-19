import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppNotification, ChatInfo, ChatMessage, ProposalRating } from './proposal.model';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api';

  // ===== Notifications =====
  notifications() {
    return this.http.get<{ items: AppNotification[]; unread: number }>(`${this.api}/notifications`);
  }
  markRead(id: number) {
    return this.http.patch<AppNotification>(`${this.api}/notifications/${id}/read`, {});
  }
  markAllRead() {
    return this.http.patch<void>(`${this.api}/notifications/read-all`, {});
  }

  // ===== Chat =====
  chat(proposalId: number) {
    return this.http.get<ChatInfo>(`${this.api}/messages/proposal/${proposalId}`);
  }
  sendMessage(proposalId: number, body: string) {
    return this.http.post<ChatMessage>(`${this.api}/messages/proposal/${proposalId}`, { body });
  }

  // ===== Rating =====
  rate(proposalId: number, stars: number, comment: string) {
    return this.http.post<ProposalRating>(`${this.api}/ratings/proposal/${proposalId}`, { stars, comment });
  }
}