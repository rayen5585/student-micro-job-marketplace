export interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  status: string;
  createdAt: string;
}

export interface JobInput {
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
}