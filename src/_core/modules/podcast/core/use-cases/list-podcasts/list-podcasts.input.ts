/**
 * Input data for listing podcasts
 */
export interface ListPodcastsInput {
  institutionId: string;
  page?: number;
  limit?: number;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
