package main

import (
	"basic-llm-integration/endpoint"
	"basic-llm-integration/ollama"
	"net/http"
)

func main() {
	cfg, err := LoadEnv()
	if err != nil {
		panic(err)
	}
	h := endpoint.NewHandler(ollama.NewClient(cfg.OllamaUrl))
	r := h.InitRouter(cfg.FrontendUrl)
	err = http.ListenAndServe(":"+cfg.Port, r)
	if err != nil {
		panic(err)
	}
}
