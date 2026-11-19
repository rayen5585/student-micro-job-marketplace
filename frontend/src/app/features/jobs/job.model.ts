export interface Job {
  id: number;
  title: string;
  description: string;
  budget: number | string;
  postedBy: number;
  skills: string[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  budget: number;
  skills?: string[];
  deadline?: string | null;
}
