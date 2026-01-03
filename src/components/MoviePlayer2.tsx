import { X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Movie } from '../types/movie';

interface MoviePlayerProps {
  movie: Movie | null;
  onClose: () => void;
}

export function MoviePlayer({ movie, onClose }: MoviePlayerProps) {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);

  if (!movie) return null;

  const isSeries = movie.content_type === 'series';
  const currentUrl = isSeries && movie.episodes.length > 0
    ? movie.episodes[selectedEpisodeIndex]?.url
    : movie.iframe_url;

  const handleOpenInNewWindow = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{
        backgroundImage: movie.backdrop_url 
          ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${movie.backdrop_url}')`
          : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full h-full max-h-screen bg-black/40 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col backdrop-blur-xl">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-black/50 border-b border-white/20 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{movie.title}</h2>
            {movie.year && (
              <p className="text-xs sm:text-sm text-slate-300">
                {movie.year} • {movie.category}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleOpenInNewWindow}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white flex items-center gap-1 sm:gap-2 group"
              title="Ouvrir dans une nouvelle fenêtre"
            >
              <ExternalLink size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs hidden sm:inline group-hover:text-white whitespace-nowrap">
                Backup Serveur 1
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white"
              title="Fermer"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {isSeries && movie.episodes.length > 0 && (
          <div className="bg-black/50 border-b border-white/20 p-3 sm:p-4 flex-shrink-0">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sélectionner un épisode
            </label>
            <select
              value={selectedEpisodeIndex}
              onChange={(e) => setSelectedEpisodeIndex(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-black/40 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
            >
              {movie.episodes.map((episode, index) => (
                <option key={index} value={index}>
                  {episode.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 relative min-h-0">
          {currentUrl ? (
            <iframe
              src={currentUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`Lecteur vidéo - ${movie.title}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-slate-300">URL non disponible</p>
            </div>
          )}
        </div>

        {movie.description && (
          <div className="p-3 sm:p-4 bg-black/50 border-t border-white/20 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-300 text-sm max-h-20 sm:max-h-32 overflow-y-auto pr-2">
              {movie.description}
            </p>
            {movie.tags && movie.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                {movie.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-black/40 text-slate-300 px-2 py-0.5 sm:px-2 sm:py-1 rounded backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}