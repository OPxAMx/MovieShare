import { X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Movie } from '../types/movie';

interface MoviePlayerProps {
  movie: Movie | null;
  onClose: () => void;
  darkMode?: boolean; // Nouvelle prop optionnelle
}

export function MoviePlayer({ movie, onClose, darkMode = true }: MoviePlayerProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className={`w-full h-full max-h-screen rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border flex flex-col backdrop-blur-xl transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900/95 border-slate-700/80' 
          : 'bg-white/95 border-slate-300/80'
      }`}>
        <div className={`flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0 transition-colors duration-300 ${
          darkMode 
            ? 'bg-slate-800/90 border-slate-700/80' 
            : 'bg-slate-100/90 border-slate-300/80'
        }`}>
          <div className="flex-1 min-w-0 mr-4">
            <h2 className={`text-lg sm:text-xl font-bold truncate transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {movie.title}
            </h2>
            {movie.year && (
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {movie.year} • {movie.category}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleOpenInNewWindow}
              className={`p-1.5 sm:p-2 rounded-lg transition flex items-center gap-1 sm:gap-2 group ${
                darkMode 
                  ? 'hover:bg-slate-700/80 text-slate-300 hover:text-white' 
                  : 'hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
              title="Ouvrir dans une nouvelle fenêtre"
            >
              <ExternalLink size={18} className="sm:w-5 sm:h-5" />
              <span className={`text-xs hidden sm:inline whitespace-nowrap transition-colors duration-300 ${
                darkMode 
                  ? 'group-hover:text-white' 
                  : 'group-hover:text-slate-900'
              }`}>
                Backup Serveur 1
              </span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-lg transition ${
                darkMode 
                  ? 'hover:bg-slate-700/80 text-slate-300 hover:text-white' 
                  : 'hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
              title="Fermer"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {isSeries && movie.episodes.length > 0 && (
          <div className={`border-b p-3 sm:p-4 flex-shrink-0 transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-800/90 border-slate-700/80' 
              : 'bg-slate-100/90 border-slate-300/80'
          }`}>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Sélectionner un épisode
            </label>
            <select
              value={selectedEpisodeIndex}
              onChange={(e) => setSelectedEpisodeIndex(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-slate-700/80 border-slate-600/80' 
                  : 'bg-slate-200/80 border-slate-400/80 text-slate-900'
              }`}
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
            <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
              darkMode ? 'bg-slate-800/50' : 'bg-slate-200/50'
            }`}>
              <p className={`transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                URL non disponible
              </p>
            </div>
          )}
        </div>

        {movie.description && (
          <div className={`p-3 sm:p-4 border-t flex-shrink-0 transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-800/90 border-slate-700/80' 
              : 'bg-slate-100/90 border-slate-300/80'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Description
            </h3>
            <p className={`text-sm max-h-20 sm:max-h-32 overflow-y-auto pr-2 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {movie.description}
            </p>
            {movie.tags && movie.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                {movie.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-0.5 sm:px-2 sm:py-1 rounded transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-slate-700/80 text-slate-300' 
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
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