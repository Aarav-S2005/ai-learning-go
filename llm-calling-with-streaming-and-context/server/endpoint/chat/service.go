package chat

import (
	"context"
	"errors"
	"strings"
	"time"

	"llm-calling-with-streaming-and-context/database"
	"llm-calling-with-streaming-and-context/ollama"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var (
	ErrChatNotFound = errors.New("chat not found or access denied")
)

type Service struct {
	repo         Repository
	ollamaClient *ollama.Client
}

func NewService(repo Repository, ollamaClient *ollama.Client) *Service {
	return &Service{
		repo:         repo,
		ollamaClient: ollamaClient,
	}
}

func (s *Service) ListChats(ctx context.Context, userID bson.ObjectID) ([]database.Chat, error) {
	return s.repo.ListChats(ctx, userID)
}

func (s *Service) GetChat(ctx context.Context, userID, chatID bson.ObjectID) (*database.Chat, []database.Message, error) {
	chat, err := s.repo.FindChatByIDAndUserID(ctx, chatID, userID)
	if err != nil {
		return nil, nil, err
	}

	messages, err := s.repo.FindMessagesByChatID(ctx, chatID)
	if err != nil {
		return nil, nil, err
	}

	return chat, messages, nil
}

func (s *Service) CreateChat(ctx context.Context, userID bson.ObjectID, title string) (*database.Chat, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		title = "New Chat"
	}

	now := time.Now().UTC()
	chat := database.Chat{
		ID:        bson.NewObjectID(),
		UserID:    userID,
		Title:     title,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.CreateChat(ctx, &chat); err != nil {
		return nil, err
	}
	return &chat, nil
}

func (s *Service) BuildContextMessages(ctx context.Context, chatID bson.ObjectID, currentMessage string) ([]ollama.Message, error) {
	dbMessages, err := s.repo.FindMessagesByChatID(ctx, chatID)
	if err != nil {
		return nil, err
	}

	var promptMessages []ollama.Message
	for _, m := range dbMessages {
		if m.UserChat != "" {
			promptMessages = append(promptMessages, ollama.Message{
				Role:    "user",
				Content: m.UserChat,
			})
		}
		if m.LLMResponse != "" {
			promptMessages = append(promptMessages, ollama.Message{
				Role:    "assistant",
				Content: m.LLMResponse,
			})
		}
	}

	promptMessages = append(promptMessages, ollama.Message{
		Role:    "user",
		Content: currentMessage,
	})

	return promptMessages, nil
}

func (s *Service) SaveMessage(ctx context.Context, chatID bson.ObjectID, userChat, llmResponse string) (*database.Message, error) {
	now := time.Now().UTC()
	msg := database.Message{
		ID:          bson.NewObjectID(),
		ChatID:      chatID,
		UserChat:    userChat,
		LLMResponse: llmResponse,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.repo.CreateMessage(ctx, &msg); err != nil {
		return nil, err
	}

	_ = s.repo.UpdateChatUpdatedAt(ctx, chatID, now)

	return &msg, nil
}

func (s *Service) SendMessageNonStreaming(ctx context.Context, userID, chatID bson.ObjectID, userMessage string) (*database.Message, error) {
	_, err := s.repo.FindChatByIDAndUserID(ctx, chatID, userID)
	if err != nil {
		return nil, ErrChatNotFound
	}

	promptMessages, err := s.BuildContextMessages(ctx, chatID, userMessage)
	if err != nil {
		return nil, err
	}

	resp, err := s.ollamaClient.Chat(ctx, promptMessages)
	if err != nil {
		return nil, err
	}

	return s.SaveMessage(ctx, chatID, userMessage, resp.Message.Content)
}

func (s *Service) StreamMessage(
	ctx context.Context,
	userID, chatID bson.ObjectID,
	userMessage string,
	onChunk func(chunk *ollama.ChatResponse) error,
) (*database.Message, error) {
	_, err := s.repo.FindChatByIDAndUserID(ctx, chatID, userID)
	if err != nil {
		return nil, ErrChatNotFound
	}

	promptMessages, err := s.BuildContextMessages(ctx, chatID, userMessage)
	if err != nil {
		return nil, err
	}

	finalResp, err := s.ollamaClient.StreamChat(ctx, promptMessages, onChunk)
	if err != nil {
		return nil, err
	}

	return s.SaveMessage(ctx, chatID, userMessage, finalResp.Message.Content)
}
