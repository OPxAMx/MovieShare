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
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 
  | 'year_desc'       // Plus récent par année de production
  | 'year_asc'        // Plus ancien par année de production
  | 'date_added_desc' // Plus récemment ajouté
  | 'date_added_asc'  // Plus anciennement ajouté
  | 'title_asc'       // Titre (A-Z)
  | 'title_desc'      // Titre (Z-A)
  | 'rating_desc'     // Meilleure note
  | 'views_desc';     // Plus vus