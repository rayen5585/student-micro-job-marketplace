import { Injectable } from '@angular/core';

export type UserRoleType = 'client' | 'freelancer' | 'admin';

export interface DevUser {
  id: string;
  label: string;
  role: UserRoleType;
}

export const DEV_USERS: DevUser[] = [
  { id: '1', label: '👔 Client (user 1)', role: 'client' },
  { id: '2', label: '🧑‍💻 Freelancer (user 2)', role: 'freelancer' },
  { id: '3', label: '🧑‍💻 Freelancer 2 (user 3)', role: 'freelancer' },
  { id: '4', label: '🛡️ Admin (user 4)', role: 'admin' },
];

@Injectable({ providedIn: 'root' })
export class CurrentUser {
  // el id yet9ra men localStorage (el dropdown "Connected as" ykatbou)
  get id(): number | null {
    const v = localStorage.getItem('userId');
    return v ? Number(v) : null;
  }

  get user(): DevUser | undefined {
    const uid = String(this.id);
    return DEV_USERS.find((u) => u.id === uid);
  }

  get role(): UserRoleType | null {
    return this.user?.role ?? null;
  }

  get isClient(): boolean {
    return this.role === 'client';
  }

  get isFreelancer(): boolean {
    return this.role === 'freelancer';
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  isOwner(postedBy: number | string | null | undefined): boolean {
    return this.id !== null && postedBy != null && Number(postedBy) === this.id;
  }
}
