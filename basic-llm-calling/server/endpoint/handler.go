package endpoint

import (
	"basic-llm-integration/ollama"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

type Handler struct {
	service *Service
}

func NewHandler(client *ollama.Client) *Handler {
	return &Handler{service: NewService(client)}
}

func (h *Handler) InitRouter(frontendUrl string) chi.Router {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{frontendUrl},
		AllowedMethods:   []string{http.MethodPost},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	r.Post("/chat", h.chat)
	return r
}

func (h *Handler) chat(w http.ResponseWriter, r *http.Request) {
	var reqBody ChatRequest
	err := json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	result, err := h.service.chat(r.Context(), reqBody.Message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]string{
		"response": result.Message.Content,
	})
}
