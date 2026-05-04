package router

import (
	"net/http"

	"movieBigDataScreen/handlers"
	"movieBigDataScreen/middleware"

	"github.com/gorilla/mux"
)

func Init() *mux.Router {
	r := mux.NewRouter()

	r.Use(middleware.CORSMiddleware)

	api := r.PathPrefix("/api").Subrouter()

	auth := api.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/register", handlers.Register).Methods("POST")
	auth.HandleFunc("/login", handlers.Login).Methods("POST")

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.JWTAuthentication)
	protected.HandleFunc("/user", handlers.GetCurrentUser).Methods("GET")

	stats := protected.PathPrefix("/stats").Subrouter()
	stats.HandleFunc("/home", handlers.GetHomeStats).Methods("GET")
	stats.HandleFunc("/yearly-production", handlers.GetYearlyProduction).Methods("GET")
	stats.HandleFunc("/duration-distribution", handlers.GetDurationDistribution).Methods("GET")
	stats.HandleFunc("/rating-distribution", handlers.GetRatingDistribution).Methods("GET")
	stats.HandleFunc("/star-distribution", handlers.GetStarDistribution).Methods("GET")
	stats.HandleFunc("/yearly-rating", handlers.GetYearlyRating).Methods("GET")
	stats.HandleFunc("/country-rating", handlers.GetCountryRating).Methods("GET")
	stats.HandleFunc("/locations", handlers.GetLocationStats).Methods("GET")
	stats.HandleFunc("/languages", handlers.GetLanguageStats).Methods("GET")
	stats.HandleFunc("/top-directors", handlers.GetTopDirectors).Methods("GET")
	stats.HandleFunc("/top-actors", handlers.GetTopActors).Methods("GET")

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Movie Big Data Screen API"))
	})

	return r
}
