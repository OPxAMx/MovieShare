import type { Movie, MovieFormData } from '../types/movie';

export function exportToCSV(movies: Movie[], filename: string = 'movies.csv') {
  const headers = [
    'title',
    'description',
    'iframe_url',
    'cover_image',
    'rating',
    'category',
    'tags',
    'duration',
    'year'
  ];

  const csvContent = [
    headers.join(','),
    ...movies.map(movie => [
      escapeCSV(movie.title),
      escapeCSV(movie.description),
      escapeCSV(movie.iframe_url),
      escapeCSV(movie.cover_image),
      movie.rating,
      escapeCSV(movie.category),
      escapeCSV(movie.tags.join('|')),
      escapeCSV(movie.duration),
      movie.year || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseCSV(csvText: string): MovieFormData[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const movies: MovieFormData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const movie: MovieFormData = {
      title: values[0] || '',
      description: values[1] || '',
      iframe_url: values[2] || '',
      cover_image: values[3] || '',
      rating: parseFloat(values[4]) || 0,
      category: values[5] || 'Uncategorized',
      tags: values[6] ? values[6].split('|').filter(t => t.trim()) : [],
      duration: values[7] || '',
      year: values[8] ? parseInt(values[8]) : null
    };

    if (movie.title && movie.iframe_url) {
      movies.push(movie);
    }
  }

  return movies;
}

function escapeCSV(value: string): string {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function generateCSVTemplate(): string {
  const headers = [
    'title',
    'description',
    'iframe_url',
    'cover_image',
    'rating',
    'category',
    'tags',
    'duration',
    'year'
  ];

  const example = [
    'Mon Film Exemple',
    'Une description incroyable',
    'https://sharecloudy.com/embed/example',
    'https://image.tmdb.org/example.jpg',
    '4.5',
    'Action',
    'aventure|super-héros|2024',
    '2h 15min',
    '2024'
  ];

  return [headers.join(','), example.join(',')].join('\n');
}
