import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Movie, MovieFormData, SortOption } from '../types/movie';

export function useMovies(userId: string | undefined) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    if (!userId) {
      setMovies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [userId]);

  const addMovie = async (movieData: MovieFormData) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([{ ...movieData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      setMovies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateMovie = async (id: string, movieData: Partial<MovieFormData>) => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMovies(prev => prev.map(m => m.id === id ? data : m));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMovies(prev => prev.filter(m => m.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    return updateMovie(id, { is_favorite: isFavorite });
  };

  const updateRating = async (id: string, rating: number) => {
    return updateMovie(id, { rating });
  };

  const incrementViewCount = async (id: string) => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    return updateMovie(id, {
      view_count: movie.view_count + 1,
      last_viewed_at: new Date().toISOString()
    } as Partial<MovieFormData>);
  };

  const sortMovies = (moviesList: Movie[], sortOption: SortOption): Movie[] => {
    const sorted = [...moviesList];

    switch (sortOption) {
      case 'year_desc':
        // Plus récent par année de production (année la plus haute d'abord)
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      
      case 'year_asc':
        // Plus ancien par année de production (année la plus basse d'abord)
        return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
      
      case 'date_added_desc':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      case 'date_added_asc':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      case 'title_asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      
      case 'title_desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      
      case 'rating_desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      
      case 'views_desc':
        return sorted.sort((a, b) => b.view_count - a.view_count);
      
      default:
        return sorted;
    }
  };

  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleFavorite,
    updateRating,
    incrementViewCount,
    sortMovies,
    refreshMovies: fetchMovies
  };
}