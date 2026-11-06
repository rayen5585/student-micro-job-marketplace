export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface Proposal {
  id: number;
  jobId: number;
  freelancerId: number;
  job?: { id: number; title: string; budget?: number | string };
  freelancer?: { id: number; name: string; email: string };
  coverLetter: string;
  price: number | string; // MySQL DECIMAL yarja3 string
  deliveryDays: number;
  status: ProposalStatus;
  createdAt: string;
}

export interface CreateProposalDto {
  jobId: number;
  coverLetter: string;
  price: number;
  deliveryDays: number;
}