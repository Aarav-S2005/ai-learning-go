package chat

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"llm-calling-with-streaming-and-context/endpoint/middleware"
	"llm-calling-with-streaming-and-context/ollama"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.AuthMiddleware)

	r.Get("/", h.ListChats)
	r.Post("/", h.CreateOrStartChat)
	r.Get("/{chatID}", h.GetChat)
	r.Post("/{chatID}", h.SendMessage)

	return r
}

func (h *Handler) ListChats(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	chats, err := h.service.ListChats(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"failed to list chats"}`, http.StatusInternalServerError)
		return
	}

	res := make([]ChatItem, len(chats))
	for i, c := range chats {
		res[i] = ChatItem{
			ID:        c.ID.Hex(),
			UserID:    c.UserID.Hex(),
			Title:     c.Title,
			CreatedAt: c.CreatedAt,
			UpdatedAt: c.UpdatedAt,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *Handler) CreateOrStartChat(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req CreateChatRequest
	if r.Body != nil && r.ContentLength > 0 {
		_ = json.NewDecoder(r.Body).Decode(&req)
	}

	title := strings.TrimSpace(req.Title)
	if title == "" && req.Message != "" {
		if len(req.Message) > 30 {
			title = req.Message[:30] + "..."
		} else {
			title = req.Message
		}
	}

	chat, err := h.service.CreateChat(r.Context(), userID, title)
	if err != nil {
		http.Error(w, `{"error":"failed to create chat"}`, http.StatusInternalServerError)
		return
	}

	if strings.TrimSpace(req.Message) == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(ChatItem{
			ID:        chat.ID.Hex(),
			UserID:    chat.UserID.Hex(),
			Title:     chat.Title,
			CreatedAt: chat.CreatedAt,
			UpdatedAt: chat.UpdatedAt,
		})
		return
	}

	isStream := true
	if req.Stream != nil {
		isStream = *req.Stream
	}

	if isStream {
		h.handleStreaming(w, r, userID, chat.ID, req.Message, chat.ID.Hex())
	} else {
		h.handleNonStreaming(w, r, userID, chat.ID, req.Message)
	}
}

func (h *Handler) GetChat(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	chatIDStr := chi.URLParam(r, "chatID")
	chatID, err := bson.ObjectIDFromHex(chatIDStr)
	if err != nil {
		http.Error(w, `{"error":"invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	chat, messages, err := h.service.GetChat(r.Context(), userID, chatID)
	if err != nil {
		if err == ErrChatNotFound {
			http.Error(w, `{"error":"chat not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"failed to fetch chat"}`, http.StatusInternalServerError)
		return
	}

	msgItems := make([]MessageItem, len(messages))
	for i, m := range messages {
		msgItems[i] = MessageItem{
			ID:          m.ID.Hex(),
			ChatID:      m.ChatID.Hex(),
			UserChat:    m.UserChat,
			LLMResponse: m.LLMResponse,
			CreatedAt:   m.CreatedAt,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(ChatDetailResponse{
		ID:        chat.ID.Hex(),
		UserID:    chat.UserID.Hex(),
		Title:     chat.Title,
		CreatedAt: chat.CreatedAt,
		UpdatedAt: chat.UpdatedAt,
		Messages:  msgItems,
	})
}

func (h *Handler) SendMessage(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserID(r.Context())
	if err != nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	chatIDStr := chi.URLParam(r, "chatID")
	chatID, err := bson.ObjectIDFromHex(chatIDStr)
	if err != nil {
		http.Error(w, `{"error":"invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request payload"}`, http.StatusBadRequest)
		return
	}

	userMsg := strings.TrimSpace(req.Message)
	if userMsg == "" {
		http.Error(w, `{"error":"message cannot be empty"}`, http.StatusBadRequest)
		return
	}

	isStream := true
	if req.Stream != nil {
		isStream = *req.Stream
	}

	if isStream {
		h.handleStreaming(w, r, userID, chatID, userMsg, chatIDStr)
	} else {
		h.handleNonStreaming(w, r, userID, chatID, userMsg)
	}
}

func (h *Handler) handleStreaming(w http.ResponseWriter, r *http.Request, userID, chatID bson.ObjectID, message, chatIDStr string) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, `{"error":"streaming unsupported"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	onChunk := func(chunk *ollama.ChatResponse) error {
		data, err := json.Marshal(map[string]interface{}{
			"chat_id": chatIDStr,
			"chunk":   chunk.Message.Content,
			"done":    chunk.Done,
		})
		if err != nil {
			return err
		}
		_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
		flusher.Flush()
		return nil
	}

	savedMsg, err := h.service.StreamMessage(r.Context(), userID, chatID, message, onChunk)
	if err != nil {
		errData, _ := json.Marshal(map[string]string{"error": err.Error()})
		_, _ = fmt.Fprintf(w, "event: error\ndata: %s\n\n", errData)
		flusher.Flush()
		return
	}

	doneData, _ := json.Marshal(map[string]interface{}{
		"chat_id":    chatIDStr,
		"message_id": savedMsg.ID.Hex(),
		"done":       true,
	})
	_, _ = fmt.Fprintf(w, "event: complete\ndata: %s\n\n", doneData)
	flusher.Flush()
}

func (h *Handler) handleNonStreaming(w http.ResponseWriter, r *http.Request, userID, chatID bson.ObjectID, message string) {
	savedMsg, err := h.service.SendMessageNonStreaming(r.Context(), userID, chatID, message)
	if err != nil {
		if err == ErrChatNotFound {
			http.Error(w, `{"error":"chat not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(MessageItem{
		ID:          savedMsg.ID.Hex(),
		ChatID:      savedMsg.ChatID.Hex(),
		UserChat:    savedMsg.UserChat,
		LLMResponse: savedMsg.LLMResponse,
		CreatedAt:   savedMsg.CreatedAt,
	})
}
