import { Proposal } from '../proposals/proposal.model';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AdminJob {
  id: number;
  title: string;
  budget: number | string;
  postedBy: number;
  ownerName: string | null;
  bidsCount: number | string;
  skills: string[];
  deadline: string | null;
  createdAt: string;
}

export interface MonthStat {
  label: string;
  proposals: number;
  jobs: number;
}

export interface AdminStats {
  users: number;
  admins: number;
  jobs: number;
  proposals: number;
  totalBudget: number;
  completedValue: number;
  byStatus: Record<string, number>;
  byMonth: MonthStat[];
  recentProposals: Proposal[];
  topJobs: AdminJob[];
}