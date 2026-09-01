package main

import (
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	OllamaUrl   string `env:"OLLAMA_URL"`
	Port        string `env:"PORT"`
	FrontendUrl string `env:"FRONTEND_URL"`
}

func LoadEnv() (Config, error) {
	_ = godotenv.Load()
	cfg, err := env.ParseAs[Config]()
	if err != nil {
		return Config{}, err
	}
	return cfg, nil
}
