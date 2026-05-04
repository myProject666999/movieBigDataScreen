package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Init() error {
	dbPath := "./data/movie.db"

	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create data directory: %v", err)
	}

	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	_, err = DB.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Printf("Warning: Failed to enable foreign keys: %v", err)
	}

	log.Println("Successfully connected to SQLite database")

	if err = InitSchema(); err != nil {
		return fmt.Errorf("failed to initialize schema: %v", err)
	}

	return nil
}

func InitSchema() error {
	schemas := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS movies (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title VARCHAR(255) NOT NULL,
			original_title VARCHAR(255),
			year INTEGER,
			rating REAL,
			rating_count INTEGER,
			duration INTEGER,
			release_date DATE,
			description TEXT,
			poster_url VARCHAR(500),
			douban_url VARCHAR(500),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS directors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(255) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(name)
		)`,
		`CREATE TABLE IF NOT EXISTS actors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(255) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(name)
		)`,
		`CREATE TABLE IF NOT EXISTS genres (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(100) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(name)
		)`,
		`CREATE TABLE IF NOT EXISTS countries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(100) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(name)
		)`,
		`CREATE TABLE IF NOT EXISTS languages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name VARCHAR(100) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(name)
		)`,
		`CREATE TABLE IF NOT EXISTS movie_directors (
			movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
			director_id INTEGER REFERENCES directors(id) ON DELETE CASCADE,
			PRIMARY KEY (movie_id, director_id)
		)`,
		`CREATE TABLE IF NOT EXISTS movie_actors (
			movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
			actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
			PRIMARY KEY (movie_id, actor_id)
		)`,
		`CREATE TABLE IF NOT EXISTS movie_genres (
			movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
			genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
			PRIMARY KEY (movie_id, genre_id)
		)`,
		`CREATE TABLE IF NOT EXISTS movie_countries (
			movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
			country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
			PRIMARY KEY (movie_id, country_id)
		)`,
		`CREATE TABLE IF NOT EXISTS movie_languages (
			movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
			language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
			PRIMARY KEY (movie_id, language_id)
		)`,
	}

	for _, schema := range schemas {
		_, err := DB.Exec(schema)
		if err != nil {
			log.Printf("Warning: Schema initialization error: %v", err)
		}
	}

	return nil
}
