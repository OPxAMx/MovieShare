import { X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Movie } from '../types/movie';

interface MoviePlayerProps {
  movie: Movie | null;
  onClose: () => void;
}

export function MoviePlayer({ movie, onClose }: MoviePlayerProps) {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);

  if (!movie) return null;

  const isSeries = movie.content_type === 'series';
  const currentUrl = isSeries && movie.episodes.length > 0
    ? movie.episodes[selectedEpisodeIndex]?.url
    : movie.iframe_url;

  const handleOpenInNewWindow = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full max-h-screen bg-slate-900 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800 border-b border-slate-700 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{movie.title}</h2>
            {movie.year && (
              <p className="text-xs sm:text-sm text-slate-400">
                {movie.year} • {movie.category}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleOpenInNewWindow}
              className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white flex items-center gap-1 sm:gap-2 group"
              title="Ouvrir dans une nouvelle fenêtre"
            >
              <ExternalLink size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs hidden sm:inline group-hover:text-white whitespace-nowrap">
                Backup Serveur 1
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
              title="Fermer"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {isSeries && movie.episodes.length > 0 && (
          <div className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4 flex-shrink-0">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sélectionner un épisode
            </label>
            <select
              value={selectedEpisodeIndex}
              onChange={(e) => setSelectedEpisodeIndex(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <iframe
            src={currentUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`Lecteur vidéo - ${movie.title}`}
          />
        </div>

        {movie.description && (
          <div className="p-3 sm:p-4 bg-slate-800 border-t border-slate-700 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-400 text-sm max-h-20 sm:max-h-32 overflow-y-auto pr-2">
              {movie.description}
            </p>
            {movie.tags && movie.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                {movie.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 sm:px-2 sm:py-1 rounded"
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