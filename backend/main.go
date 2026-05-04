package main

import (
	"log"
	"net/http"
	"os"

	"movieBigDataScreen/config"
	"movieBigDataScreen/database"
	"movieBigDataScreen/router"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config.Init()

	if err := database.Init(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	r := router.Init()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
