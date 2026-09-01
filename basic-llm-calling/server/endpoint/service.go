package endpoint

import (
	"basic-llm-integration/ollama"
	"context"
)

type Service struct {
	client *ollama.Client
}

func NewService(client *ollama.Client) *Service {
	return &Service{client: client}
}

func (s *Service) chat(ctx context.Context, message string) (*ollama.ChatResponse, error) {
	result, err := s.client.Chat(ctx, []ollama.Message{{Role: "user", Content: message}})
	if err != nil {
		return nil, err
	}
	return result, nil
}
