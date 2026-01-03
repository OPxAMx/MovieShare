import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Movie, MovieFormData, Episode } from '../types/movie';

interface MovieFormProps {
  movie: Movie | null;
  onSave: (data: MovieFormData) => Promise<void>;
  onClose: () => void;
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

export function MovieForm({ movie, onSave, onClose }: MovieFormProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {movie ? 'Modifier' : 'Ajouter'} {formData.content_type === 'series' ? 'une série' : 'un film'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type de contenu *
              </label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content_type: e.target.value as 'film' | 'series',
                  episodes: e.target.value === 'film' ? [] : prev.episodes
                }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="film">Film</option>
                <option value="series">Série TV</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Le titre du film"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Iframe ShareCloudy {formData.content_type === 'film' ? '*' : '(optionnel pour les séries)'}
              </label>
              <input
                type="url"
                value={formData.iframe_url}
                onChange={(e) => setFormData(prev => ({ ...prev, iframe_url: e.target.value }))}
                required={formData.content_type === 'film'}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Image de couverture
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Description du film..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Année
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
                min="1900"
                max="2100"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Durée
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2h 30min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Note initiale
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Épisodes
                </label>
                <div className="space-y-3 mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={episodeName}
                      onChange={(e) => setEpisodeName(e.target.value)}
                      placeholder="Ex: Épisode 1 - Titre de l'épisode"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={episodeUrl}
                      onChange={(e) => setEpisodeUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addEpisode}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2"
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
                        className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{episode.name}</p>
                          <p className="text-slate-400 text-sm truncate">{episode.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEpisode(index)}
                          className="ml-2 p-2 hover:bg-slate-600 rounded-lg transition text-red-400"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition"
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
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
