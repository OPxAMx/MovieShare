import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Movie, MovieFormData } from '../types/movie';
import { exportToCSV, parseCSV, generateCSVTemplate } from '../utils/csvUtils';

interface CSVManagerProps {
  movies: Movie[];
  onImport: (movies: MovieFormData[]) => Promise<void>;
  darkMode?: boolean; // Nouvelle prop optionnelle
}

export function CSVManager({ movies, onImport, darkMode = true }: CSVManagerProps) {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToCSV(movies, `movies_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_movies.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      const parsedMovies = parseCSV(text);

      if (parsedMovies.length === 0) {
        alert('Aucun film valide trouvé dans le fichier CSV');
        return;
      }

      await onImport(parsedMovies);
      setImportStatus({ success: parsedMovies.length, errors: 0 });
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Erreur lors de l\'importation du fichier CSV');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`rounded-xl p-6 border transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white/80 border-slate-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-slate-900'
      }`}>
        <FileText size={20} />
        Gestion CSV
      </h3>

      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={movies.length === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition disabled:cursor-not-allowed ${
            darkMode 
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 disabled:bg-slate-200 text-white disabled:text-slate-500'
          }`}
        >
          <Download size={20} />
          Exporter tous les films ({movies.length})
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition disabled:cursor-not-allowed ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-500'
          }`}
        >
          <Upload size={20} />
          {importing ? 'Importation...' : 'Importer depuis CSV'}
        </button>

        <button
          onClick={handleDownloadTemplate}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
            darkMode 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          <FileText size={20} />
          Télécharger modèle CSV
        </button>

        {importStatus && (
          <div className={`px-4 py-3 rounded-lg text-sm flex items-start gap-2 transition-colors duration-300 ${
            darkMode 
              ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
              : 'bg-green-100 border border-green-200 text-green-700'
          }`}>
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Importation réussie !</p>
              <p>{importStatus.success} film(s) importé(s)</p>
            </div>
          </div>
        )}

        <div className={`rounded-lg p-4 text-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-slate-700/50 text-slate-400' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Format CSV attendu :
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Colonnes : title, description, iframe_url, cover_image, rating, category, tags, duration, year</li>
            <li>• Tags séparés par le caractère | (pipe)</li>
            <li>• Encodage UTF-8 avec BOM</li>
            <li>• Téléchargez le modèle pour voir un exemple</li>
          </ul>
        </div>
      </div>
    </div>
  );
}