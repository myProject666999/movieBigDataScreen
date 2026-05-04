package handlers

import (
	"encoding/json"
	"net/http"

	"movieBigDataScreen/database"
	"movieBigDataScreen/models"
)

type HomeStats struct {
	MovieCount        int                      `json:"movie_count"`
	TopRating         float64                  `json:"top_rating"`
	TopActor          models.ActorStat         `json:"top_actor"`
	TopCountry        models.LocationStat      `json:"top_country"`
	GenreDistribution []models.GenreDistribution `json:"genre_distribution"`
	RatingByYear      []models.StatRating      `json:"rating_by_year"`
	MovieList         []models.MovieListItem   `json:"movie_list"`
}

func GetHomeStats(w http.ResponseWriter, r *http.Request) {
	var stats HomeStats

	err := database.DB.QueryRow("SELECT COUNT(*) FROM movies").Scan(&stats.MovieCount)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	err = database.DB.QueryRow("SELECT COALESCE(MAX(rating), 0) FROM movies").Scan(&stats.TopRating)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	actorRows, err := database.DB.Query(`
		SELECT a.name, COUNT(ma.movie_id) as movie_count
		FROM actors a
		JOIN movie_actors ma ON a.id = ma.actor_id
		GROUP BY a.id, a.name
		ORDER BY movie_count DESC
		LIMIT 1
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer actorRows.Close()

	for actorRows.Next() {
		actorRows.Scan(&stats.TopActor.Name, &stats.TopActor.MovieCount)
	}

	countryRows, err := database.DB.Query(`
		SELECT c.name, COUNT(mc.movie_id) as count
		FROM countries c
		JOIN movie_countries mc ON c.id = mc.country_id
		GROUP BY c.id, c.name
		ORDER BY count DESC
		LIMIT 1
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer countryRows.Close()

	for countryRows.Next() {
		countryRows.Scan(&stats.TopCountry.Location, &stats.TopCountry.Count)
	}

	genreRows, err := database.DB.Query(`
		SELECT g.name, COUNT(mg.movie_id) as count
		FROM genres g
		JOIN movie_genres mg ON g.id = mg.genre_id
		GROUP BY g.id, g.name
		ORDER BY count DESC
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer genreRows.Close()

	for genreRows.Next() {
		var gd models.GenreDistribution
		genreRows.Scan(&gd.Name, &gd.Count)
		stats.GenreDistribution = append(stats.GenreDistribution, gd)
	}

	ratingRows, err := database.DB.Query(`
		SELECT year, AVG(rating) as avg_rating
		FROM movies
		WHERE year IS NOT NULL AND rating IS NOT NULL
		GROUP BY year
		ORDER BY year
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer ratingRows.Close()

	for ratingRows.Next() {
		var sr models.StatRating
		ratingRows.Scan(&sr.Year, &sr.Rating)
		stats.RatingByYear = append(stats.RatingByYear, sr)
	}

	movieRows, err := database.DB.Query(`
		SELECT m.id, m.title, m.year, m.rating, m.rating_count, m.duration, m.poster_url,
			   STRING_AGG(g.name, ', ') as genres
		FROM movies m
		LEFT JOIN movie_genres mg ON m.id = mg.movie_id
		LEFT JOIN genres g ON mg.genre_id = g.id
		GROUP BY m.id, m.title, m.year, m.rating, m.rating_count, m.duration, m.poster_url
		ORDER BY m.rating DESC
		LIMIT 10
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer movieRows.Close()

	for movieRows.Next() {
		var ml models.MovieListItem
		movieRows.Scan(&ml.ID, &ml.Title, &ml.Year, &ml.Rating, &ml.RatingCount, &ml.Duration, &ml.PosterURL, &ml.Genres)
		stats.MovieList = append(stats.MovieList, ml)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetYearlyProduction(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT year, COUNT(*) as count
		FROM movies
		WHERE year IS NOT NULL
		GROUP BY year
		ORDER BY year
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var production []models.YearProduction
	for rows.Next() {
		var yp models.YearProduction
		rows.Scan(&yp.Year, &yp.Count)
		production = append(production, yp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(production)
}

func GetDurationDistribution(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT 
			CASE 
				WHEN duration < 60 THEN '0-60分钟'
				WHEN duration >= 60 AND duration < 90 THEN '60-90分钟'
				WHEN duration >= 90 AND duration < 120 THEN '90-120分钟'
				WHEN duration >= 120 AND duration < 150 THEN '120-150分钟'
				ELSE '150分钟以上'
			END as range,
			COUNT(*) as count
		FROM movies
		WHERE duration IS NOT NULL
		GROUP BY range
		ORDER BY MIN(duration)
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var distribution []models.DurationDistribution
	for rows.Next() {
		var dd models.DurationDistribution
		rows.Scan(&dd.Range, &dd.Count)
		distribution = append(distribution, dd)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(distribution)
}

func GetRatingDistribution(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT rating, COUNT(*) as count
		FROM movies
		WHERE rating IS NOT NULL
		GROUP BY rating
		ORDER BY rating
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var distribution []models.RatingDistribution
	for rows.Next() {
		var rd models.RatingDistribution
		rows.Scan(&rd.Rating, &rd.Count)
		distribution = append(distribution, rd)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(distribution)
}

func GetStarDistribution(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT 
			CASE 
				WHEN rating >= 9.0 THEN '五星'
				WHEN rating >= 8.0 AND rating < 9.0 THEN '四星半'
				WHEN rating >= 7.0 AND rating < 8.0 THEN '四星'
				WHEN rating >= 6.0 AND rating < 7.0 THEN '三星半'
				WHEN rating >= 5.0 AND rating < 6.0 THEN '三星'
				WHEN rating >= 4.0 AND rating < 5.0 THEN '二星半'
				WHEN rating >= 3.0 AND rating < 4.0 THEN '二星'
				ELSE '一星及以下'
			END as star,
			COUNT(*) as count
		FROM movies
		WHERE rating IS NOT NULL
		GROUP BY star
		ORDER BY MIN(rating) DESC
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var distribution []models.StarDistribution
	for rows.Next() {
		var sd models.StarDistribution
		rows.Scan(&sd.Star, &sd.Count)
		distribution = append(distribution, sd)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(distribution)
}

func GetYearlyRating(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT year, AVG(rating) as avg_rating, COUNT(*) as count
		FROM movies
		WHERE year IS NOT NULL AND rating IS NOT NULL
		GROUP BY year
		ORDER BY year
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stats []models.YearRatingStat
	for rows.Next() {
		var ys models.YearRatingStat
		rows.Scan(&ys.Year, &ys.Rating, &ys.Count)
		stats = append(stats, ys)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetCountryRating(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT c.name as country, AVG(m.rating) as avg_rating, COUNT(*) as count
		FROM movies m
		JOIN movie_countries mc ON m.id = mc.movie_id
		JOIN countries c ON mc.country_id = c.id
		WHERE m.rating IS NOT NULL
		GROUP BY c.name
		ORDER BY count DESC
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stats []models.CountryRating
	for rows.Next() {
		var cs models.CountryRating
		rows.Scan(&cs.Country, &cs.Rating, &cs.Count)
		stats = append(stats, cs)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetLocationStats(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT c.name as location, COUNT(mc.movie_id) as count
		FROM countries c
		JOIN movie_countries mc ON c.id = mc.country_id
		GROUP BY c.id, c.name
		ORDER BY count DESC
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stats []models.LocationStat
	for rows.Next() {
		var ls models.LocationStat
		rows.Scan(&ls.Location, &ls.Count)
		stats = append(stats, ls)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetLanguageStats(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT l.name as language, COUNT(ml.movie_id) as count
		FROM languages l
		JOIN movie_languages ml ON l.id = ml.language_id
		GROUP BY l.id, l.name
		ORDER BY count DESC
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stats []models.LanguageStat
	for rows.Next() {
		var ls models.LanguageStat
		rows.Scan(&ls.Language, &ls.Count)
		stats = append(stats, ls)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetTopDirectors(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT d.name, COUNT(md.movie_id) as movie_count
		FROM directors d
		JOIN movie_directors md ON d.id = md.director_id
		GROUP BY d.id, d.name
		ORDER BY movie_count DESC
		LIMIT 20
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var directors []models.DirectorStat
	for rows.Next() {
		var ds models.DirectorStat
		rows.Scan(&ds.Name, &ds.MovieCount)
		directors = append(directors, ds)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(directors)
}

func GetTopActors(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT a.name, COUNT(ma.movie_id) as movie_count
		FROM actors a
		JOIN movie_actors ma ON a.id = ma.actor_id
		GROUP BY a.id, a.name
		ORDER BY movie_count DESC
		LIMIT 20
	`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var actors []models.ActorStat
	for rows.Next() {
		var as models.ActorStat
		rows.Scan(&as.Name, &as.MovieCount)
		actors = append(actors, as)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(actors)
}
