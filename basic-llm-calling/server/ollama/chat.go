package ollama

import (
	"context"
	"fmt"
)

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Model      string  `json:"model"`
	Message    Message `json:"message"`
	Done       bool    `json:"done"`
	DoneReason string  `json:"done_reason"`
}

func (c *Client) Chat(
	ctx context.Context,
	messages []Message,
) (*ChatResponse, error) {

	req := ChatRequest{
		Model:    "gemma4:e4b",
		Messages: messages,
		Stream:   false,
	}

	var result ChatResponse

	resp, err := c.http.R().
		SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetBody(req).
		SetResult(&result).
		Post("/api/chat")

	if err != nil {
		return nil, err
	}

	if !resp.IsSuccess() {
		return nil, fmt.Errorf(
			"ollama returned %d: %s",
			resp.StatusCode(),
			resp.String(),
		)
	}

	return &result, nil
}
