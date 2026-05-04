package models

import (
	"time"
)

type Movie struct {
	ID            int       `json:"id"`
	Title         string    `json:"title"`
	OriginalTitle string    `json:"original_title"`
	Year          int       `json:"year"`
	Rating        float64   `json:"rating"`
	RatingCount   int       `json:"rating_count"`
	Duration      int       `json:"duration"`
	ReleaseDate   time.Time `json:"release_date"`
	Description   string    `json:"description"`
	PosterURL     string    `json:"poster_url"`
	DoubanURL     string    `json:"douban_url"`
	Directors     []string  `json:"directors"`
	Actors        []string  `json:"actors"`
	Genres        []string  `json:"genres"`
	Countries     []string  `json:"countries"`
	Languages     []string  `json:"languages"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type MovieListItem struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Year        int     `json:"year"`
	Rating      float64 `json:"rating"`
	RatingCount int     `json:"rating_count"`
	Duration    int     `json:"duration"`
	PosterURL   string  `json:"poster_url"`
	Genres      string  `json:"genres"`
}

type StatCount struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type StatRating struct {
	Year   int     `json:"year"`
	Rating float64 `json:"rating"`
}

type StatValue struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
}

type DirectorStat struct {
	Name      string `json:"name"`
	MovieCount int    `json:"movie_count"`
}

type ActorStat struct {
	Name       string `json:"name"`
	MovieCount int    `json:"movie_count"`
}

type GenreDistribution struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type YearProduction struct {
	Year  int `json:"year"`
	Count int `json:"count"`
}

type DurationDistribution struct {
	Range string `json:"range"`
	Count int    `json:"count"`
}

type RatingDistribution struct {
	Rating float64 `json:"rating"`
	Count  int     `json:"count"`
}

type StarDistribution struct {
	Star  string `json:"star"`
	Count int    `json:"count"`
}

type YearRatingStat struct {
	Year   int     `json:"year"`
	Rating float64 `json:"rating"`
	Count  int     `json:"count"`
}

type CountryRating struct {
	Country string  `json:"country"`
	Rating  float64 `json:"rating"`
	Count   int     `json:"count"`
}

type LocationStat struct {
	Location string `json:"location"`
	Count    int    `json:"count"`
}

type LanguageStat struct {
	Language string `json:"language"`
	Count    int    `json:"count"`
}
