import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Movie, MovieFormData, Episode } from '../types/movie';

interface MovieFormProps {
  movie: Movie | null;
  onSave: (data: MovieFormData) => Promise<void>;
  onClose: () => void;
  darkMode?: boolean; // Nouvelle prop optionnelle
}

const CATEGORIES = [
  'Uncategorized',
  'Action',
  'Animation',
  'Aventure',
  'Comédie',
  'Crime',
  'Documentaire',
  'Drame',
  'Fantastique',
  'Guerre',
  'Horreur',
  'Mystère',
  'Romance',
  'Science-Fiction',
  'Thriller',
  'Western'
];

export function MovieForm({ movie, onSave, onClose, darkMode = true }: MovieFormProps) {
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    iframe_url: '',
    cover_image: '',
    rating: 0,
    category: 'Uncategorized',
    tags: [],
    duration: '',
    year: null,
    content_type: 'film',
    episodes: []
  });
  const [tagInput, setTagInput] = useState('');
  const [episodeName, setEpisodeName] = useState('');
  const [episodeUrl, setEpisodeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        iframe_url: movie.iframe_url,
        cover_image: movie.cover_image,
        rating: movie.rating,
        category: movie.category,
        tags: movie.tags || [],
        duration: movie.duration,
        year: movie.year,
        content_type: movie.content_type,
        episodes: movie.episodes || []
      });
    }
  }, [movie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addEpisode = () => {
    if (episodeName.trim() && episodeUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        episodes: [...prev.episodes, { name: episodeName.trim(), url: episodeUrl.trim() }]
      }));
      setEpisodeName('');
      setEpisodeUrl('');
    }
  };

  const removeEpisode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      episodes: prev.episodes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
      }}>
      <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border my-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {movie ? 'Modifier' : 'Ajouter'} {formData.content_type === 'series' ? 'une série' : 'un film'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              darkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Type de contenu *
              </label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content_type: e.target.value as 'film' | 'series',
                  episodes: e.target.value === 'film' ? [] : prev.episodes
                }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="film">Film</option>
                <option value="series">Série TV</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Le titre du film"
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                URL Iframe ShareCloudy {formData.content_type === 'film' ? '*' : '(optionnel pour les séries)'}
              </label>
              <input
                type="url"
                value={formData.iframe_url}
                onChange={(e) => setFormData(prev => ({ ...prev, iframe_url: e.target.value }))}
                required={formData.content_type === 'film'}
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                URL Image de couverture
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Description du film..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Année
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
                min="1900"
                max="2100"
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="2024"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Durée
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="2h 30min"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Note initiale
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} {rating > 0 ? '★' : '☆'}
                  </option>
                ))}
              </select>
            </div>

            {formData.content_type === 'series' && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Épisodes
                </label>
                <div className="space-y-3 mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={episodeName}
                      onChange={(e) => setEpisodeName(e.target.value)}
                      placeholder="Ex: Épisode 1 - Titre de l'épisode"
                      className={`flex-1 px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={episodeUrl}
                      onChange={(e) => setEpisodeUrl(e.target.value)}
                      placeholder="https://..."
                      className={`flex-1 px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addEpisode}
                      className={`px-4 py-2 text-white rounded-lg transition flex items-center gap-2 ${
                        darkMode 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-blue-400 hover:bg-blue-500'
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                {formData.episodes.length > 0 && (
                  <div className="space-y-2">
                    {formData.episodes.map((episode, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-slate-700' : 'bg-slate-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>{episode.name}</p>
                          <p className={`text-sm truncate transition-colors duration-300 ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>{episode.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEpisode(index)}
                          className={`ml-2 p-2 rounded-lg transition ${
                            darkMode 
                              ? 'hover:bg-slate-600 text-red-400' 
                              : 'hover:bg-slate-200 text-red-500'
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={`px-4 py-2 text-white rounded-lg transition flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-blue-400 hover:bg-blue-500'
                  }`}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={`hover:text-red-400 transition ${
                        darkMode ? 'hover:text-red-400' : 'hover:text-red-500'
                      }`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg transition ${
                darkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white font-medium rounded-lg transition disabled:opacity-50 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500'
              }`}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}