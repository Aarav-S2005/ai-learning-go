package main

import (
	"fmt"
	"log"
	"net/http"

	"llm-calling-with-streaming-and-context/database"
	"llm-calling-with-streaming-and-context/endpoint"
	"llm-calling-with-streaming-and-context/ollama"
)

func main() {
	cfg, err := LoadEnv()
	if err != nil {
		log.Fatalf("failed to load environment config: %v", err)
	}

	mongoClient, err := database.NewMongo(cfg.IsDev, cfg.MongoUri, cfg.DatabaseName)
	if err != nil {
		log.Fatalf("failed to connect to MongoDB at %s: %v", cfg.MongoUri, err)
	}
	defer func() {
		_ = mongoClient.Disconnect(nil)
	}()

	db := mongoClient.Database(cfg.DatabaseName)
	log.Printf("Connected to MongoDB [%s]", cfg.DatabaseName)

	ollamaClient := ollama.NewClient(cfg.OllamaUrl, cfg.OllamaModel)
	log.Printf("Initialized Ollama Client (URL: %s, Model: %s)", cfg.OllamaUrl, cfg.OllamaModel)

	h := endpoint.NewHandler(db, ollamaClient)
	router := h.InitRouter(cfg.FrontendUrl)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server running on http://localhost%s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("server terminated unexpectedly: %v", err)
	}
}
