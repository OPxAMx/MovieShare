class MoviePlayer {
	constructor(config = {}) {
		this.movie = config.movie || null;
		this.darkMode = config.darkMode ?? true;
		this.allMovies = config.allMovies || [];
		this.container = document.getElementById("movie-player-container");
		this.onClose = config.onClose || (() => {});
		this.onPlayMovie = config.onPlayMovie || (() => {});
		this.onToggleFavorite = config.onToggleFavorite || (() => {});

		this.selectedEpisodeIndex = 0;
		this.autoPlayNext = true;
		this.autoPlayTimer = null;

		this.init();
	}

	init() {
		if (!this.container) {
			this.createContainer();
		}
	}

	createContainer() {
		this.container = document.createElement("div");
		this.container.id = "movie-player-container";
		this.container.className = "hidden";
		document.body.appendChild(this.container);
	}

	show(movie) {
		this.movie = movie;
		this.selectedEpisodeIndex = 0;
		this.render();
		this.container.classList.remove("hidden");
		document.body.style.overflow = "hidden";
	}

	hide() {
		this.container.classList.add("hidden");
		document.body.style.overflow = "";
		this.clearAutoPlayTimer();
		this.onClose();
	}

	render() {
		if (!this.movie) return;

		const isSeries = this.movie.content_type === "series";
		const episodes = this.movie.episodes || [];
		const currentUrl =
			isSeries && episodes.length > 0
				? episodes[this.selectedEpisodeIndex]?.url
				: this.movie.iframe_url;

		const hasNextEpisode =
			isSeries && this.selectedEpisodeIndex < episodes.length - 1;

		// Créer la structure HTML
		this.container.innerHTML = `
            <div class="player-overlay">
                <div class="player-content">
                    <!-- Header -->
                    <div class="player-header">
                        <div class="movie-info">
                            <h1 class="movie-title">${this.escapeHtml(
																													this.movie.title
																												)}</h1>
                            <div class="movie-meta">
                                ${
																																	this.movie.year
																																		? `<span class="meta-item"><i class="fas fa-calendar"></i> ${this.movie.year}</span>`
																																		: ""
																																}
                                ${
																																	this.movie.category
																																		? `<span class="meta-item"><i class="fas fa-film"></i> ${this.movie.category}</span>`
																																		: ""
																																}
                                ${
																																	this.movie.duration
																																		? `<span class="meta-item"><i class="fas fa-clock"></i> ${this.movie.duration}</span>`
																																		: ""
																																}
                                ${
																																	this.movie.rating
																																		? `<span class="meta-item rating-badge"><i class="fas fa-star"></i> ${this.movie.rating}</span>`
																																		: ""
																																}
                            </div>
                        </div>
                        <div class="player-controls">
                            <button class="btn btn-secondary" onclick="moviePlayer.openInNewWindow()" title="Ouvrir dans une nouvelle fenêtre">
                                <i class="fas fa-external-link-alt"></i>
                                <span>Backup Serveur</span>
                            </button>
                            ${
																													this.movie.is_favorite !== undefined
																														? `
                                <button class="btn btn-icon" onclick="moviePlayer.toggleFavorite()" title="${
																																	this.movie.is_favorite
																																		? "Retirer des favoris"
																																		: "Ajouter aux favoris"
																																}">
                                    <i class="fas fa-heart ${
																																					this.movie.is_favorite
																																						? "text-red-500"
																																						: ""
																																				}"></i>
                                </button>
                            `
																														: ""
																												}
                            <button class="btn btn-close btn-icon" onclick="moviePlayer.hide()" title="Fermer">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Épisodes (pour les séries) -->
                    ${
																					isSeries && episodes.length > 0
																						? `
                        <div class="episodes-section">
                            <div class="section-header">
                                <h3 class="section-title"><i class="fas fa-list-ol"></i> Épisodes</h3>
                                ${
																																	hasNextEpisode
																																		? `
                                    <button class="auto-play-toggle ${
																																					this.autoPlayNext ? "active" : ""
																																				}" onclick="moviePlayer.toggleAutoPlay()">
                                        <i class="fas fa-forward"></i>
                                        Lecture auto: ${
																																									this.autoPlayNext ? "ON" : "OFF"
																																								}
                                    </button>
                                `
																																		: ""
																																}
                            </div>
                            <select class="episode-selector" onchange="moviePlayer.selectEpisode(this.value)">
                                ${episodes
																																	.map(
																																		(ep, index) => `
                                    <option value="${index}" ${
																																			index === this.selectedEpisodeIndex
																																				? "selected"
																																				: ""
																																		}>
                                        Épisode ${index + 1}: ${this.escapeHtml(
																																			ep.name || `Épisode ${index + 1}`
																																		)}
                                    </option>
                                `
																																	)
																																	.join("")}
                            </select>
                            <div class="episode-info">
                                <p class="episode-description">${
																																	episodes[this.selectedEpisodeIndex]
																																		?.description || ""
																																}</p>
                            </div>
                        </div>
                    `
																						: ""
																				}
                    
                    <!-- Lecteur vidéo -->
                    <div class="video-container">
                        ${
																									currentUrl
																										? `
                            <iframe 
                                src="${currentUrl}"
                                class="video-iframe"
                                allowfullscreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                title="Lecteur vidéo - ${this.escapeHtml(
																																	this.movie.title
																																)}"
                            ></iframe>
                        `
																										: `
                            <div class="video-placeholder">
                                <div class="placeholder-content">
                                    <i class="fas fa-video-slash fa-2x"></i>
                                    <p>URL non disponible</p>
                                </div>
                            </div>
                        `
																								}
                    </div>
                    
                    <!-- Description et tags -->
                    ${
																					this.movie.description ||
																					(this.movie.tags && this.movie.tags.length > 0)
																						? `
                        <div class="description-section">
                            ${
																													this.movie.description
																														? `
                                <h3 class="description-title">Synopsis</h3>
                                <div class="description-content">${this.escapeHtml(
																																	this.movie.description
																																)}</div>
                            `
																														: ""
																												}
                            ${
																													this.movie.tags && this.movie.tags.length > 0
																														? `
                                <div class="movie-tags">
                                    ${this.movie.tags
																																					.map(
																																						(tag) => `
                                        <span class="tag">${this.escapeHtml(
																																									tag
																																								)}</span>
                                    `
																																					)
																																					.join("")}
                                </div>
                            `
																														: ""
																												}
                        </div>
                    `
																						: ""
																				}
                    
                    <!-- Titres similaires -->
                    ${
																					this.allMovies.length > 0
																						? `
                        <div class="similar-titles">
                            <h3><i class="fas fa-th-list"></i> Contenu similaire</h3>
                            <div class="similar-grid">
                                ${this.getSimilarMovies()
																																	.slice(0, 6)
																																	.map(
																																		(movie) => `
                                    <div class="similar-card" onclick="moviePlayer.playSimilarMovie('${
																																					movie.id
																																				}')">
                                        <div class="card-image" style="background-image: url('${
																																									movie.cover_image || ""
																																								}')">
                                            <div class="card-overlay">
                                                <button class="card-play-btn">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="card-info">
                                            <h4 class="card-title">${this.escapeHtml(
																																													movie.title
																																												)}</h4>
                                            <p class="card-meta">${
																																													movie.year || ""
																																												} • ${movie.category || ""}</p>
                                        </div>
                                    </div>
                                `
																																	)
																																	.join("")}
                            </div>
                        </div>
                    `
																						: ""
																				}
                </div>
            </div>
        `;

		// Démarrer l'autoplay si nécessaire
		if (isSeries && this.autoPlayNext && hasNextEpisode) {
			this.startAutoPlayTimer();
		}
	}

	openInNewWindow() {
		const isSeries = this.movie.content_type === "series";
		const episodes = this.movie.episodes || [];
		const currentUrl =
			isSeries && episodes.length > 0
				? episodes[this.selectedEpisodeIndex]?.url
				: this.movie.iframe_url;

		if (currentUrl) {
			window.open(currentUrl, "_blank", "noopener,noreferrer");
		}
	}

	selectEpisode(index) {
		this.selectedEpisodeIndex = parseInt(index);
		this.render();
	}

	toggleAutoPlay() {
		this.autoPlayNext = !this.autoPlayNext;
		if (this.autoPlayNext) {
			this.startAutoPlayTimer();
		} else {
			this.clearAutoPlayTimer();
		}
		this.render();
	}

	startAutoPlayTimer() {
		this.clearAutoPlayTimer();

		const isSeries = this.movie.content_type === "series";
		const episodes = this.movie.episodes || [];
		const hasNextEpisode =
			isSeries && this.selectedEpisodeIndex < episodes.length - 1;

		if (!isSeries || !this.autoPlayNext || !hasNextEpisode) return;

		this.autoPlayTimer = setTimeout(() => {
			this.selectedEpisodeIndex++;
			this.render();
		}, 5000); // 5 secondes avant le prochain épisode
	}

	clearAutoPlayTimer() {
		if (this.autoPlayTimer) {
			clearTimeout(this.autoPlayTimer);
			this.autoPlayTimer = null;
		}
	}

	toggleFavorite() {
		if (this.onToggleFavorite && this.movie) {
			const newFavoriteState = !this.movie.is_favorite;
			this.onToggleFavorite(this.movie.id, newFavoriteState);
			this.movie.is_favorite = newFavoriteState;
			this.render();
		}
	}

	playSimilarMovie(movieId) {
		const movie = this.allMovies.find((m) => m.id === movieId);
		if (movie && this.onPlayMovie) {
			this.onPlayMovie(movie);
		}
	}

	getSimilarMovies() {
		if (!this.movie || this.allMovies.length === 0) return [];

		return this.allMovies
			.filter((m) => m.id !== this.movie.id)
			.sort((a, b) => {
				// Simplicité : priorité par catégorie et année
				let scoreA = 0;
				let scoreB = 0;

				if (a.category === this.movie.category) scoreA += 3;
				if (Math.abs((a.year || 0) - (this.movie.year || 0)) <= 5) scoreA += 2;
				if (a.tags?.some((tag) => this.movie.tags?.includes(tag))) scoreA += 1;

				if (b.category === this.movie.category) scoreB += 3;
				if (Math.abs((b.year || 0) - (this.movie.year || 0)) <= 5) scoreB += 2;
				if (b.tags?.some((tag) => this.movie.tags?.includes(tag))) scoreB += 1;

				return scoreB - scoreA;
			})
			.slice(0, 10);
	}

	escapeHtml(text) {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	updateTheme(darkMode) {
		this.darkMode = darkMode;
		document.body.className = darkMode ? "dark-mode" : "light-mode";
	}
}

// Instance globale
let moviePlayer = null;

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
	moviePlayer = new MoviePlayer({
		darkMode: true,
		onClose: () => console.log("Player closed"),
		onPlayMovie: (movie) => {
			console.log("Play movie:", movie.title);
			moviePlayer.show(movie);
		},
		onToggleFavorite: (id, isFavorite) => {
			console.log(`Toggle favorite for ${id}: ${isFavorite}`);
			// Implémentez votre logique de favoris ici
		}
	});

	// Fonction globale pour ouvrir le lecteur
	window.openMoviePlayer = (movieData) => {
		if (moviePlayer) {
			moviePlayer.show(movieData);
		}
	};

	// Exemple de données de test
	window.sampleMovie = {
		id: "1",
		title: "Inception",
		year: 2010,
		category: "Science-Fiction",
		duration: "2h28m",
		rating: "8.8",
		description:
			"Dom Cobb est un voleur expérimenté dans l'art périlleux de l'extraction : sa spécialité est de s'approprier les secrets les plus précieux d'un individu, enfouis au plus profond de son subconscient, pendant qu'il rêve et que son esprit est particulièrement vulnérable.",
		tags: ["Science-Fiction", "Thriller", "Action"],
		cover_image:
			"https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
		content_type: "movie",
		iframe_url: "https://www.youtube.com/embed/YoHD9XEInc0",
		episodes: []
	};
});

class CSVToMoviePlayer {
	constructor() {
		this.movies = [];
		this.series = [];
		this.allContent = [];
		this.categories = {};
	}

	// Parser CSV
	parseCSV(csvText) {
		const lines = csvText.trim().split("\n");
		if (lines.length === 0) return [];

		const headers = lines[0].split(",").map((h) => h.trim());
		const results = [];

		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];
			if (!line.trim()) continue;

			const values = this.parseCSVLine(line);
			const obj = {};

			for (let j = 0; j < headers.length; j++) {
				let value = values[j] || "";
				value = value.trim();

				// Gestion des champs spécifiques
				switch (headers[j]) {
					case "rating":
						value = parseFloat(value) || 0;
						break;
					case "year":
						value = parseInt(value) || 0;
						break;
					case "duration":
						value = this.parseDuration(value);
						break;
					case "tags":
						value = value ? value.split(",").map((tag) => tag.trim()) : [];
						break;
					case "content_type":
						value = this.detectContentType(values[0] || "", value);
						break;
				}

				obj[headers[j]] = value;
			}

			// Ajouter des champs manquants
			obj.id = this.generateId(obj.title, obj.year);
			obj.content_type = obj.content_type || "movie";
			obj.cover_image = obj.cover_image || this.getDefaultCover(obj.category);
			obj.is_favorite = Math.random() > 0.7; // Pour l'exemple

			// Détecter les séries par titre et épisodes
			if (this.isSeries(obj)) {
				obj.content_type = "series";
				obj.episodes = this.generateEpisodesForSeries(obj);
			}

			results.push(obj);
		}

		return results;
	}

	parseCSVLine(line) {
		const values = [];
		let currentValue = "";
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			const nextChar = line[i + 1];

			if (char === '"' && !inQuotes) {
				inQuotes = true;
			} else if (char === '"' && inQuotes && nextChar === '"') {
				currentValue += '"';
				i++; // Skip next quote
			} else if (char === '"' && inQuotes) {
				inQuotes = false;
			} else if (char === "," && !inQuotes) {
				values.push(currentValue);
				currentValue = "";
			} else {
				currentValue += char;
			}
		}

		values.push(currentValue);
		return values;
	}

	parseDuration(duration) {
		if (!duration) return "";

		// Convertir "120min" en "2h"
		const match = duration.match(/(\d+)/);
		if (match) {
			const minutes = parseInt(match[1]);
			if (minutes >= 60) {
				const hours = Math.floor(minutes / 60);
				const remainingMinutes = minutes % 60;
				return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
			}
			return `${minutes}min`;
		}
		return duration;
	}

	detectContentType(title, existingType) {
		if (existingType) return existingType;

		// Détecter les séries par des mots-clés
		const seriesKeywords = [
			"saison",
			"season",
			"épisode",
			"episode",
			"partie",
			"part"
		];
		const titleLower = title.toLowerCase();

		for (const keyword of seriesKeywords) {
			if (titleLower.includes(keyword)) {
				return "series";
			}
		}

		return "movie";
	}

	isSeries(movie) {
		const title = movie.title.toLowerCase();
		return (
			title.includes("saison") ||
			title.includes("season") ||
			title.includes("épisode") ||
			title.includes("episode")
		);
	}

	generateEpisodesForSeries(series) {
		const episodes = [];
		const title = series.title;

		// Extraire le numéro de saison
		const seasonMatch =
			title.match(/saison\s*(\d+)/i) || title.match(/season\s*(\d+)/i);
		const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : 1;

		// Générer 4 à 8 épisodes par saison
		const episodeCount = Math.floor(Math.random() * 5) + 4;

		for (let i = 1; i <= episodeCount; i++) {
			episodes.push({
				name: `Épisode ${i}`,
				url: series.iframe_url || "",
				description: `Épisode ${i} de ${title}`
			});
		}

		return episodes;
	}

	generateId(title, year) {
		return `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${year}`;
	}

	getDefaultCover(category) {
		const defaultCovers = {
			"Science-Fiction":
				"https://tse2.mm.bing.net/th/id/OIP.4j8jX9Q8Xk6XvZ7vQ5Z5YQHaEK?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Comédie:
				"https://tse2.mm.bing.net/th/id/OIP.6Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Action:
				"https://tse2.mm.bing.net/th/id/OIP.9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Horreur:
				"https://tse2.mm.bing.net/th/id/OIP.1A1A1A1A1A1A1A1A1A1A1A1A1A1A?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Animation:
				"https://tse2.mm.bing.net/th/id/OIP.2B2B2B2B2B2B2B2B2B2B2B2B2B2B?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Drame:
				"https://tse2.mm.bing.net/th/id/OIP.3C3C3C3C3C3C3C3C3C3C3C3C3C3C?w=287&h=180&c=7&r=0&o=5&pid=1.7",
			Crime:
				"https://tse2.mm.bing.net/th/id/OIP.4D4D4D4D4D4D4D4D4D4D4D4D4D4D?w=287&h=180&c=7&r=0&o=5&pid=1.7"
		};

		return (
			defaultCovers[category] ||
			"https://via.placeholder.com/300x450?text=No+Image"
		);
	}

	// Organiser par catégories
	organizeByCategory(movies) {
		const categories = {};

		movies.forEach((movie) => {
			const category = movie.category || "Non catégorisé";
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push(movie);
		});

		return categories;
	}

	// Charger depuis un fichier CSV
	async loadFromCSVFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const csvText = event.target.result;
					this.allContent = this.parseCSV(csvText);
					this.categories = this.organizeByCategory(this.allContent);

					// Séparer films et séries
					this.movies = this.allContent.filter(
						(item) => item.content_type === "movie"
					);
					this.series = this.allContent.filter(
						(item) => item.content_type === "series"
					);

					console.log(`Chargé: ${this.allContent.length} contenus`);
					console.log(`Films: ${this.movies.length}`);
					console.log(`Séries: ${this.series.length}`);
					console.log("Catégories:", Object.keys(this.categories));

					resolve(this.allContent);
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = () => {
				reject(new Error("Erreur de lecture du fichier"));
			};

			reader.readAsText(file);
		});
	}

	// Charger depuis une URL
	async loadFromURL(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const csvText = await response.text();
			this.allContent = this.parseCSV(csvText);
			this.categories = this.organizeByCategory(this.allContent);

			this.movies = this.allContent.filter(
				(item) => item.content_type === "movie"
			);
			this.series = this.allContent.filter(
				(item) => item.content_type === "series"
			);

			return this.allContent;
		} catch (error) {
			console.error("Erreur de chargement:", error);
			throw error;
		}
	}

	// Obtenir les films populaires (par rating)
	getPopularMovies(limit = 12) {
		return [...this.movies].sort((a, b) => b.rating - a.rating).slice(0, limit);
	}

	// Obtenir les films récents
	getRecentMovies(limit = 12) {
		return [...this.movies].sort((a, b) => b.year - a.year).slice(0, limit);
	}

	// Rechercher des films
	searchMovies(query) {
		const searchTerm = query.toLowerCase();
		return this.allContent.filter(
			(movie) =>
				movie.title.toLowerCase().includes(searchTerm) ||
				(movie.description &&
					movie.description.toLowerCase().includes(searchTerm)) ||
				(movie.tags &&
					movie.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
		);
	}

	// Obtenir les films par catégorie
	getMoviesByCategory(category, limit = 12) {
		return (this.categories[category] || []).slice(0, limit);
	}
}

// Intégration avec le Movie Player existant
class MoviePlayerWithCSV extends MoviePlayer {
	constructor(config = {}) {
		super(config);
		this.csvParser = new CSVToMoviePlayer();
		this.initialized = false;
	}

	async initializeWithCSV(csvData) {
		try {
			// Si c'est un fichier
			if (csvData instanceof File) {
				await this.csvParser.loadFromCSVFile(csvData);
			}
			// Si c'est une URL
			else if (typeof csvData === "string") {
				await this.csvParser.loadFromURL(csvData);
			}
			// Si c'est du texte CSV
			else if (typeof csvData === "string" && csvData.includes(",")) {
				this.csvParser.allContent = this.csvParser.parseCSV(csvData);
				this.csvParser.categories = this.csvParser.organizeByCategory(
					this.csvParser.allContent
				);
			}

			// Mettre à jour la liste des films
			this.allMovies = this.csvParser.allContent;
			this.initialized = true;

			// Mettre à jour l'interface
			this.updateUI();

			console.log(
				"Movie Player initialisé avec CSV:",
				this.allMovies.length,
				"contenus"
			);
			return true;
		} catch (error) {
			console.error("Erreur d'initialisation:", error);
			return false;
		}
	}

	updateUI() {
		if (!this.initialized || !this.csvParser.allContent.length) return;

		// Mettre à jour les sections de la page
		this.updatePopularMovies();
		this.updateCategories();
		this.updateSeriesSection();

		// Ajouter la fonction de recherche
		this.addSearchFunctionality();
	}

	updatePopularMovies() {
		const popularMovies = this.csvParser.getPopularMovies(12);
		const container = document.getElementById("popular-movies");
		if (!container) return;

		container.innerHTML = popularMovies
			.map((movie) => this.createMovieCardHTML(movie))
			.join("");
		this.attachMovieCardEvents();
	}

	updateCategories() {
		const categories = Object.keys(this.csvParser.categories);

		// Mettre à jour les sections existantes ou en créer de nouvelles
		categories.forEach((category) => {
			const movies = this.csvParser.getMoviesByCategory(category, 8);
			if (movies.length === 0) return;

			const sectionId = `category-${category
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "-")}`;
			let section = document.getElementById(sectionId);

			if (!section) {
				section = this.createCategorySection(category, sectionId);
				const mainContainer = document.querySelector(".page-container");
				if (mainContainer) {
					const infoPanel = document.querySelector(".info-panel");
					if (infoPanel) {
						mainContainer.insertBefore(section, infoPanel);
					} else {
						mainContainer.appendChild(section);
					}
				}
			}

			const grid = section.querySelector(".movies-grid");
			if (grid) {
				grid.innerHTML = movies
					.map((movie) => this.createMovieCardHTML(movie))
					.join("");
			}
		});

		this.attachMovieCardEvents();
	}

	updateSeriesSection() {
		const series = this.csvParser.series.slice(0, 12);
		const container = document.getElementById("series-grid");
		if (!container) return;

		container.innerHTML = series
			.map((series) => this.createMovieCardHTML(series))
			.join("");
		this.attachMovieCardEvents();
	}

	createCategorySection(category, id) {
		const section = document.createElement("section");
		section.className = "category-section";
		section.id = id;

		section.innerHTML = `
            <h2 class="category-title">
                <i class="fas fa-${this.getCategoryIcon(
																	category
																)}"></i> ${category}
            </h2>
            <div class="movies-grid"></div>
        `;

		return section;
	}

	getCategoryIcon(category) {
		const icons = {
			"Science-Fiction": "rocket",
			Comédie: "laugh",
			Action: "explosion",
			Horreur: "ghost",
			Animation: "film",
			Drame: "theater-masks",
			Crime: "user-secret",
			Fantastique: "hat-wizard",
			Thriller: "heartbeat",
			Aventure: "map"
		};

		return icons[category] || "film";
	}

	createMovieCardHTML(movie) {
		const isSeries = movie.content_type === "series";
		const duration = movie.duration || "";

		return `
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="movie-card-image" style="background-image: url('${
																	movie.cover_image
																}')">
                    <div class="movie-card-overlay">
                        <button class="play-btn" onclick="event.stopPropagation(); window.openMoviePlayerFromCSV('${
																									movie.id
																								}')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    ${
																					isSeries
																						? '<div class="series-badge"><i class="fas fa-tv"></i> Série</div>'
																						: ""
																				}
                    ${
																					movie.rating > 0
																						? `<div class="rating-badge-card"><i class="fas fa-star"></i> ${movie.rating}</div>`
																						: ""
																				}
                </div>
                <div class="movie-card-content">
                    <h3 class="movie-card-title">${this.escapeHtml(
																					movie.title
																				)}</h3>
                    <div class="movie-card-meta">
                        ${
																									movie.year
																										? `<span><i class="fas fa-calendar"></i> ${movie.year}</span>`
																										: ""
																								}
                        ${
																									duration
																										? `<span><i class="fas fa-clock"></i> ${duration}</span>`
																										: ""
																								}
                        ${
																									isSeries
																										? `<span><i class="fas fa-list-ol"></i> ${
																												movie.episodes?.length || 0
																										  } épisodes</span>`
																										: ""
																								}
                    </div>
                    ${
																					movie.description
																						? `<p class="movie-card-description">${this.escapeHtml(
																								movie.description.substring(0, 100)
																						  )}${movie.description.length > 100 ? "..." : ""}</p>`
																						: ""
																				}
                    ${
																					movie.tags && movie.tags.length > 0
																						? `
                        <div class="movie-card-tags">
                            ${movie.tags
																													.slice(0, 2)
																													.map(
																														(tag) =>
																															`<span class="movie-card-tag">${this.escapeHtml(
																																tag
																															)}</span>`
																													)
																													.join("")}
                        </div>
                    `
																						: ""
																				}
                </div>
            </div>
        `;
	}

	attachMovieCardEvents() {
		document.querySelectorAll(".movie-card").forEach((card) => {
			card.addEventListener("click", function () {
				const movieId = this.getAttribute("data-movie-id");
				const movie = moviePlayerCSV.csvParser.allContent.find(
					(m) => m.id === movieId
				);
				if (movie) {
					window.openMoviePlayerFromCSV(movieId);
				}
			});
		});
	}

	addSearchFunctionality() {
		// Créer la barre de recherche si elle n'existe pas
		if (!document.getElementById("search-container")) {
			const controlsSection = document.querySelector(".controls-section");
			if (controlsSection) {
				const searchContainer = document.createElement("div");
				searchContainer.id = "search-container";
				searchContainer.className = "search-container";
				searchContainer.innerHTML = `
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="movie-search" placeholder="Rechercher un film ou une série...">
                        <button id="search-btn">Rechercher</button>
                    </div>
                    <div id="search-results" class="search-results hidden"></div>
                `;
				controlsSection.appendChild(searchContainer);

				// Événements de recherche
				const searchInput = document.getElementById("movie-search");
				const searchBtn = document.getElementById("search-btn");

				const performSearch = () => {
					const query = searchInput.value.trim();
					if (query.length < 2) {
						document.getElementById("search-results").classList.add("hidden");
						return;
					}

					const results = this.csvParser.searchMovies(query);
					this.displaySearchResults(results);
				};

				searchInput.addEventListener("input", performSearch);
				searchBtn.addEventListener("click", performSearch);
				searchInput.addEventListener("keypress", (e) => {
					if (e.key === "Enter") performSearch();
				});
			}
		}
	}

	displaySearchResults(results) {
		const resultsContainer = document.getElementById("search-results");
		if (!resultsContainer) return;

		if (results.length === 0) {
			resultsContainer.innerHTML =
				'<div class="no-results">Aucun résultat trouvé</div>';
			resultsContainer.classList.remove("hidden");
			return;
		}

		resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>${results.length} résultat(s) trouvé(s)</h4>
                <button class="close-results"><i class="fas fa-times"></i></button>
            </div>
            <div class="results-grid">
                ${results
																	.slice(0, 8)
																	.map(
																		(movie) => `
                    <div class="result-card" data-movie-id="${movie.id}">
                        <div class="result-image" style="background-image: url('${
																									movie.cover_image
																								}')"></div>
                        <div class="result-info">
                            <h5>${this.escapeHtml(movie.title)}</h5>
                            <p>${movie.year} • ${movie.category}</p>
                            <p class="result-description">${this.escapeHtml(
																													movie.description?.substring(0, 80) || ""
																												)}...</p>
                        </div>
                    </div>
                `
																	)
																	.join("")}
            </div>
        `;

		resultsContainer.classList.remove("hidden");

		// Événements
		resultsContainer
			.querySelector(".close-results")
			.addEventListener("click", () => {
				resultsContainer.classList.add("hidden");
			});

		resultsContainer.querySelectorAll(".result-card").forEach((card) => {
			card.addEventListener("click", function () {
				const movieId = this.getAttribute("data-movie-id");
				const movie = moviePlayerCSV.csvParser.allContent.find(
					(m) => m.id === movieId
				);
				if (movie) {
					window.openMoviePlayerFromCSV(movieId);
					resultsContainer.classList.add("hidden");
				}
			});
		});
	}

	escapeHtml(text) {
		if (!text) return "";
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}
}

// Styles CSS supplémentaires
const additionalStyles = `
    /* Styles pour le CSV Movie Player */
    .series-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, var(--hbo-purple), var(--hbo-blue));
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .rating-badge-card {
        position: absolute;
        top: 10px;
        left: 10px;
        background: linear-gradient(135deg, var(--netflix-red), #ff9500);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .search-container {
        margin-top: 20px;
        width: 100%;
    }
    
    .search-box {
        display: flex;
        align-items: center;
        background: var(--netflix-dark-gray);
        border-radius: 12px;
        padding: 10px 16px;
        border: 1px solid var(--netflix-light-gray);
        gap: 12px;
    }
    
    .search-box i {
        color: var(--netflix-text-secondary);
    }
    
    #movie-search {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--netflix-text);
        font-size: 15px;
        outline: none;
    }
    
    #movie-search::placeholder {
        color: var(--netflix-text-muted);
    }
    
    #search-btn {
        background: var(--netflix-red);
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background var(--transition-fast);
    }
    
    #search-btn:hover {
        background: var(--netflix-dark-red);
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--netflix-dark-gray);
        border-radius: 12px;
        margin-top: 8px;
        border: 1px solid var(--netflix-light-gray);
        z-index: 1000;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: var(--shadow-lg);
    }
    
    .search-results.hidden {
        display: none;
    }
    
    .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--netflix-light-gray);
    }
    
    .results-header h4 {
        color: var(--netflix-text);
        font-size: 14px;
        font-weight: 600;
    }
    
    .close-results {
        background: none;
        border: none;
        color: var(--netflix-text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
    }
    
    .close-results:hover {
        color: var(--netflix-red);
        background: rgba(229, 9, 20, 0.1);
    }
    
    .results-grid {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .result-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background var(--transition-fast);
    }
    
    .result-card:hover {
        background: var(--netflix-gray);
    }
    
    .result-image {
        width: 60px;
        height: 80px;
        border-radius: 6px;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
    }
    
    .result-info {
        flex: 1;
        min-width: 0;
    }
    
    .result-info h5 {
        color: var(--netflix-text);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .result-info p {
        color: var(--netflix-text-secondary);
        font-size: 12px;
        margin-bottom: 4px;
    }
    
    .result-description {
        color: var(--netflix-text-muted);
        font-size: 11px;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .no-results {
        padding: 32px;
        text-align: center;
        color: var(--netflix-text-secondary);
    }
    
    .csv-upload-container {
        margin-top: 20px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .csv-upload-container h3 {
        color: var(--netflix-red);
        margin-bottom: 15px;
        font-size: 1.2rem;
    }
    
    .upload-btn {
        background: var(--netflix-red);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: background var(--transition-fast);
    }
    
    .upload-btn:hover {
        background: var(--netflix-dark-red);
    }
    
    #csv-file {
        display: none;
    }
    
    .upload-status {
        margin-top: 10px;
        font-size: 14px;
        color: var(--netflix-text-secondary);
    }
    
    .upload-success {
        color: #10b981;
    }
    
    .upload-error {
        color: #ef4444;
    }
`;

// Ajouter les styles à la page
document.addEventListener("DOMContentLoaded", function () {
	const styleElement = document.createElement("style");
	styleElement.textContent = additionalStyles;
	document.head.appendChild(styleElement);
});

// Instance globale avec support CSV
let moviePlayerCSV = null;

// Initialisation complète
document.addEventListener("DOMContentLoaded", function () {
	moviePlayerCSV = new MoviePlayerWithCSV({
		darkMode: true,
		onClose: () => console.log("Player fermé"),
		onPlayMovie: (movie) => {
			console.log("Lecture du film:", movie.title);
			moviePlayerCSV.show(movie);
		},
		onToggleFavorite: (id, isFavorite) => {
			console.log(`Favori ${id}: ${isFavorite ? "ajouté" : "retiré"}`);
			const movie = moviePlayerCSV.allMovies.find((m) => m.id === id);
			if (movie) {
				movie.is_favorite = isFavorite;
			}
		}
	});

	// Ajouter l'interface d'upload CSV
	addCSVUploadInterface();

	// Exporter les fonctions
	window.moviePlayerCSV = moviePlayerCSV;
	window.openMoviePlayerFromCSV = (movieId) => {
		if (moviePlayerCSV && moviePlayerCSV.csvParser) {
			const movie = moviePlayerCSV.csvParser.allContent.find(
				(m) => m.id === movieId
			);
			if (movie) {
				moviePlayerCSV.show(movie);
			}
		}
	};
});

function addCSVUploadInterface() {
	const infoPanel = document.querySelector(".info-panel");
	if (!infoPanel) return;

	const uploadContainer = document.createElement("div");
	uploadContainer.className = "csv-upload-container";
	uploadContainer.innerHTML = `
        <h3><i class="fas fa-file-csv"></i> Charger votre fichier CSV</h3>
        <div class="upload-controls">
            <label for="csv-file" class="upload-btn">
                <i class="fas fa-upload"></i> Choisir un fichier CSV
            </label>
            <input type="file" id="csv-file" accept=".csv">
            <div class="upload-status"></div>
        </div>
        <div class="upload-info">
            <p style="margin-top: 15px; color: var(--netflix-text-secondary); font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Le fichier CSV doit contenir les colonnes suivantes:<br>
                <code>title,description,iframe_url,cover_image,rating,category,tags,duration,year</code>
            </p>
        </div>
    `;

	infoPanel.parentNode.insertBefore(uploadContainer, infoPanel);

	// Événement d'upload
	document
		.getElementById("csv-file")
		.addEventListener("change", async function (e) {
			const file = e.target.files[0];
			if (!file) return;

			const statusElement = document.querySelector(".upload-status");
			statusElement.textContent = "Chargement en cours...";
			statusElement.className = "upload-status";

			try {
				const success = await moviePlayerCSV.initializeWithCSV(file);
				if (success) {
					statusElement.textContent = `✓ Chargé ${moviePlayerCSV.csvParser.allContent.length} contenus avec succès!`;
					statusElement.className = "upload-status upload-success";

					// Démonstration automatique
					setTimeout(() => {
						const firstMovie = moviePlayerCSV.csvParser.allContent[0];
						if (firstMovie) {
							console.log("Ouverture automatique du premier film:", firstMovie.title);
						}
					}, 1000);
				}
			} catch (error) {
				statusElement.textContent = `✗ Erreur: ${error.message}`;
				statusElement.className = "upload-status upload-error";
				console.error("Erreur de chargement CSV:", error);
			}
		});
}

// Fonction de démonstration avec les données fournies
async function loadSampleCSVData() {
	console.log("Chargement des données CSV d'exemple...");

	// Créer une chaîne CSV à partir des données fournies
	const csvData = `title,description,iframe_url,cover_image,rating,category,tags,duration,year
Alien: Earth,"Lorsqu'un mystérieux vaisseau spatial s'écrase sur la Terre...",,https://tse1.mm.bing.net/th/id/OIP.XEfM8AhPvmhGNP64J6ILHQHaLH?rs=1&pid=ImgDetMain&o=7&rm=3,5,Science-Fiction,,60min,2025
La Meneuse,Une fêtarde repentie doit faire ses preuves...,,https://fr.web.img3.acsta.net/img/0e/68/0e682f76ff844da8236a8c64cea95705.jpg,5,Comédie,,35min,2025
The Studio Saison 1,"Seth Rogen joue le nouveau directeur d'un studio de cinéma...",,https://m.media-amazon.com/images/M/MV5BMDQxMWI5OTMtNGRkMC00NTVlLWI5ZjAtZmFiMjMwM2M0N2E0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg,4,Comédie,,35min,2025
Loki Saison 2,"La nouvelle série Disney+ Original des studios Marvel...",,https://sbstatesman.com/wp-content/uploads/2023/11/loki.jpg,5,Science-Fiction,,50min,2022`;

	try {
		const success = await moviePlayerCSV.initializeWithCSV(csvData);
		if (success) {
			console.log("Données d'exemple chargées avec succès!");
			console.log(
				"Total de contenus:",
				moviePlayerCSV.csvParser.allContent.length
			);

			// Afficher un message
			const statusElement = document.querySelector(".upload-status");
			if (statusElement) {
				statusElement.textContent = `✓ Chargé ${moviePlayerCSV.csvParser.allContent.length} contenus de démonstration`;
				statusElement.className = "upload-status upload-success";
			}
		}
	} catch (error) {
		console.error("Erreur de chargement des données d'exemple:", error);
	}
}

// Charger automatiquement les données d'exemple au démarrage
setTimeout(loadSampleCSVData, 1000);
