package endpoint

import (
	"net/http"

	"llm-calling-with-streaming-and-context/endpoint/chat"
	"llm-calling-with-streaming-and-context/endpoint/user"
	"llm-calling-with-streaming-and-context/ollama"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Handler struct {
	userHandler *user.Handler
	chatHandler *chat.Handler
}

func NewHandler(db *mongo.Database, ollamaClient *ollama.Client) *Handler {
	userRepo := user.NewRepository(db)
	chatRepo := chat.NewRepository(db)

	userService := user.NewService(userRepo)
	chatService := chat.NewService(chatRepo, ollamaClient)

	return &Handler{
		userHandler: user.NewHandler(userService),
		chatHandler: chat.NewHandler(chatService),
	}
}

func (h *Handler) InitRouter(frontendUrl string) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{frontendUrl, "http://localhost:*", "http://127.0.0.1:*"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	r.Mount("/auth", h.userHandler.Routes())
	r.Mount("/user/auth", h.userHandler.Routes())

	r.Mount("/chat", h.chatHandler.Routes())

	return r
}
