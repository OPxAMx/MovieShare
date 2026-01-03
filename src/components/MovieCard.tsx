import { Star, Heart, Play, Edit, Trash2, Eye } from 'lucide-react';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onRate: (id: string, rating: number) => void;
  darkMode?: boolean; // Nouvelle prop optionnelle
}

export function MovieCard({
  movie,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRate,
  darkMode = true
}: MovieCardProps) {
  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => {
              e.stopPropagation();
              onRate(movie.id, star);
            }}
            className="transition hover:scale-110"
          >
            <Star
              size={16}
              className={`transition ${
                star <= movie.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : darkMode 
                    ? 'text-slate-600' 
                    : 'text-slate-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border group ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className={`relative aspect-[2/3] overflow-hidden ${
        darkMode ? 'bg-slate-900' : 'bg-slate-100'
      }`}>
        {movie.cover_image ? (
          <img
            src={movie.cover_image}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
              : 'bg-gradient-to-br from-slate-200 to-slate-300'
          }`}>
            <svg className={`w-20 h-20 ${
              darkMode ? 'text-slate-600' : 'text-slate-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onPlay(movie)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300 ${
              darkMode 
                ? 'bg-blue-500' 
                : 'bg-blue-400'
            }`}>
              <Play size={32} className="text-white fill-white" />
            </div>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id, !movie.is_favorite);
          }}
          className={`absolute top-3 right-3 backdrop-blur-sm p-2 rounded-full transition z-10 ${
            darkMode 
              ? 'bg-black/50 hover:bg-black/70' 
              : 'bg-white/50 hover:bg-white/70'
          }`}
        >
          <Heart
            size={20}
            className={`transition ${
              movie.is_favorite
                ? 'fill-red-500 text-red-500'
                : darkMode ? 'text-white' : 'text-slate-700'
            }`}
          />
        </button>

        {movie.year && (
          <div className={`absolute top-3 left-3 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium ${
            darkMode 
              ? 'bg-black/50 text-white' 
              : 'bg-white/50 text-slate-700'
          }`}>
            {movie.year}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-semibold text-lg line-clamp-2 flex-1 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {movie.title}
          </h3>
        </div>

        {movie.category && (
          <span className={`inline-block text-xs px-2 py-1 rounded mb-2 transition-colors duration-300 ${
            darkMode 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {movie.category}
          </span>
        )}

        {movie.description && (
          <p className={`text-sm line-clamp-2 mb-3 transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {movie.description}
          </p>
        )}

        <div className={`flex items-center gap-4 mb-3 text-xs transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {movie.duration && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {movie.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {movie.view_count}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {renderStars()}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(movie);
              }}
              className={`p-2 rounded-lg transition ${
                darkMode 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-blue-400' 
                  : 'hover:bg-slate-200 text-slate-500 hover:text-blue-500'
              }`}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
                  onDelete(movie.id);
                }
              }}
              className={`p-2 rounded-lg transition ${
                darkMode 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' 
                  : 'hover:bg-slate-200 text-slate-500 hover:text-red-500'
              }`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {movie.tags && movie.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {movie.tags.map((tag, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-0.5 rounded transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 text-slate-300' 
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}