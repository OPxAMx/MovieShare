export interface Episode {
  name: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  iframe_url: string;
  cover_image: string;
  rating: number;
  category: string;
  tags: string[];
  duration: string;
  year: number | null;
  is_favorite: boolean;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  content_type: 'film' | 'series';
  episodes: Episode[];
}

export interface MovieFormData {
  title: string;
  description: string;
  iframe_url: string;
  cover_image: string;
  rating: number;
  category: string;
  tags: string[];
  duration: string;
  year: number | null;
  content_type: 'film' | 'series';
  episodes: Episode[];
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'date_added_desc' | 'date_added_asc' | 'year_desc' | 'year_asc' | 'title_asc' | 'title_desc' | 'rating_desc' | 'views_desc';
