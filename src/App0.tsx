import { useState, useMemo } from 'react';
import { Plus, Search, Film, LogOut, Grid, List, Heart, TrendingUp, Calendar, BarChart3, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useMovies } from './hooks/useMovies';
import { AuthForm } from './components/AuthForm';
import { MovieCard } from './components/MovieCard';
import { MovieForm } from './components/MovieForm';
import { MoviePlayer } from './components/MoviePlayer';
import { CSVManager } from './components/CSVManager';
import type { Movie, ViewMode, SortOption, MovieFormData } from './types/movie';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    movies,
    loading: moviesLoading,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleFavorite,
    updateRating,
    incrementViewCount,
    sortMovies
  } = useMovies(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCSVManager, setShowCSVManager] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(movies.map(m => m.category));
    return ['all', ...Array.from(cats).sort()];
  }, [movies]);

  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(movie => movie.category === selectedCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(movie => movie.is_favorite);
    }

    return sortMovies(filtered, sortOption);
  }, [movies, searchQuery, selectedCategory, showFavoritesOnly, sortOption, sortMovies]);

  const stats = useMemo(() => ({
    total: movies.length,
    favorites: movies.filter(m => m.is_favorite).length,
    totalViews: movies.reduce((sum, m) => sum + m.view_count, 0),
    avgRating: movies.length > 0
      ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
      : '0'
  }), [movies]);

  const handleSaveMovie = async (data: MovieFormData) => {
    if (editingMovie) {
      await updateMovie(editingMovie.id, data);
    } else {
      await addMovie(data);
    }
    setShowForm(false);
    setEditingMovie(null);
  };

  const handlePlayMovie = (movie: Movie) => {
    setPlayingMovie(movie);
    incrementViewCount(movie.id);
  };

  const handleImportCSV = async (importedMovies: MovieFormData[]) => {
    for (const movie of importedMovies) {
      await addMovie(movie);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40 transition-all duration-300">
        <div className={`container mx-auto px-4 ${headerCollapsed ? 'py-2' : 'py-4'} transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MovieShare</h1>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHeaderCollapsed(!headerCollapsed)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
                title={headerCollapsed ? "Agrandir l'en-tête" : "Réduire l'en-tête"}
              >
                {headerCollapsed ? (
                  <>
                    <ChevronDown size={16} />
                    <span className="hidden sm:inline">Agrandir</span>
                  </>
                ) : (
                  <>
                    <ChevronUp size={16} />
                    <span className="hidden sm:inline">Réduire</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditingMovie(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition text-sm"
                title="Ajouter un film"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
              <button
                onClick={() => setShowCSVManager(!showCSVManager)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition text-sm"
                title="Gestion CSV"
              >
                <Download size={16} />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {!headerCollapsed && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Film size={16} />
                    Total
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Heart size={16} />
                    Favoris
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.favorites}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <TrendingUp size={16} />
                    Vues
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <BarChart3 size={16} />
                    Note Moy.
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.avgRating} ★</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des films..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Toutes les catégories' : cat}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date_desc">Plus récent</option>
                  <option value="date_asc">Plus ancien</option>
                  <option value="title_asc">Titre (A-Z)</option>
                  <option value="title_desc">Titre (Z-A)</option>
                  <option value="rating_desc">Meilleure note</option>
                  <option value="views_desc">Plus vus</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-4 py-2 rounded-lg transition ${
                      showFavoritesOnly
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    <Heart size={20} className={showFavoritesOnly ? 'fill-white' : ''} />
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showCSVManager && (
          <div className="mb-6">
            <CSVManager movies={movies} onImport={handleImportCSV} />
          </div>
        )}

        {moviesLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">Chargement des films...</div>
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Film size={64} className="mb-4 opacity-50" />
            <p className="text-xl mb-2">
              {searchQuery || selectedCategory !== 'all' || showFavoritesOnly
                ? 'Aucun film trouvé'
                : 'Aucun film dans votre bibliothèque'}
            </p>
            <p className="text-sm">
              {searchQuery || selectedCategory !== 'all' || showFavoritesOnly
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier film'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={handlePlayMovie}
                onEdit={(m) => {
                  setEditingMovie(m);
                  setShowForm(true);
                }}
                onDelete={deleteMovie}
                onToggleFavorite={toggleFavorite}
                onRate={updateRating}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSave={handleSaveMovie}
          onClose={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
        />
      )}

      {playingMovie && (
        <MoviePlayer
          movie={playingMovie}
          onClose={() => setPlayingMovie(null)}
        />
      )}
    </div>
  );
}

export default App;