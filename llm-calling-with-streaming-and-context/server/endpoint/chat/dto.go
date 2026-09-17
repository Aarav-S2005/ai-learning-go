package chat

import (
	"time"
)

type CreateChatRequest struct {
	Title   string `json:"title,omitempty"`
	Message string `json:"message,omitempty"`
	Stream  *bool  `json:"stream,omitempty"`
}

type SendMessageRequest struct {
	Message string `json:"message"`
	Stream  *bool  `json:"stream,omitempty"`
}

type MessageItem struct {
	ID          string    `json:"id"`
	ChatID      string    `json:"chat_id"`
	UserChat    string    `json:"user_chat"`
	LLMResponse string    `json:"llm_response"`
	CreatedAt   time.Time `json:"created_at"`
}

type ChatItem struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ChatDetailResponse struct {
	ID        string        `json:"id"`
	UserID    string        `json:"user_id"`
	Title     string        `json:"title"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
	Messages  []MessageItem `json:"messages"`
}
