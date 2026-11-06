export type JobSort = 'relevance' | 'newest' | 'highest_paying' | 'urgent';
export type BidSort = 'best_value' | 'lowest_price' | 'highest_price' | 'fastest' | 'newest';

export interface JobItem {
  id: number;
  title: string;
  description: string;
  budget: number | string; // MySQL DECIMAL yarja3 string
  postedBy: number;
  skills: string[];
  deadline: string | null;
  isUrgent: boolean;
  createdAt: string;
}

export interface Facet {
  name: string;
  count: number;
}

export interface SearchResult {
  jobs: JobItem[];
  facets: Facet[];
  total: number;
  page: number;
  pages: number;
  sort: JobSort;
}

export interface SearchParams {
  q?: string;
  skills?: string[];
  minBudget?: number | null;
  maxBudget?: number | null;
  urgent?: boolean;
  sort?: JobSort;
  page?: number;
}