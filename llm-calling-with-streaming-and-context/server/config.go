package main

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	OllamaUrl    string `env:"OLLAMA_URL" envDefault:"http://localhost:11434"`
	OllamaModel  string `env:"OLLAMA_MODEL" envDefault:"llama3"`
	Port         string `env:"PORT" envDefault:"3000"`
	FrontendUrl  string `env:"FRONTEND_URL" envDefault:"http://localhost:5173"`
	MongoUri     string `env:"MONGO_URI" envDefault:"mongodb://localhost:27017"`
	DatabaseName string `env:"DB_NAME" envDefault:"ai_learning_golang"`
	IsDev        bool   `env:"IS_DEV" envDefault:"true"`
}

func LoadEnv() (Config, error) {
	_ = godotenv.Load()
	cfg, err := env.ParseAs[Config]()
	if err != nil {
		return Config{}, err
	}
	return cfg, nil
}

