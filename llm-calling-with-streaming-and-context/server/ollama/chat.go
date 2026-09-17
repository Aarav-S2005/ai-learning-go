package ollama

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"strings"
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
	CreatedAt  string  `json:"created_at,omitempty"`
	Message    Message `json:"message"`
	Done       bool    `json:"done"`
	DoneReason string  `json:"done_reason,omitempty"`
}

func (c *Client) Chat(
	ctx context.Context,
	messages []Message,
	model ...string,
) (*ChatResponse, error) {
	selectedModel := c.defaultModel
	if len(model) > 0 && model[0] != "" {
		selectedModel = model[0]
	}

	req := ChatRequest{
		Model:    selectedModel,
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

func (c *Client) StreamChat(
	ctx context.Context,
	messages []Message,
	onChunk func(chunk *ChatResponse) error,
	model ...string,
) (*ChatResponse, error) {
	selectedModel := c.defaultModel
	if len(model) > 0 && model[0] != "" {
		selectedModel = model[0]
	}

	req := ChatRequest{
		Model:    selectedModel,
		Messages: messages,
		Stream:   true,
	}

	resp, err := c.http.R().
		SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetBody(req).
		SetDoNotParseResponse(true).
		Post("/api/chat")

	if err != nil {
		return nil, err
	}

	if !resp.IsSuccess() {
		defer resp.RawBody().Close()
		return nil, fmt.Errorf(
			"ollama returned %d: %s",
			resp.StatusCode(),
			resp.String(),
		)
	}

	defer resp.RawBody().Close()

	scanner := bufio.NewScanner(resp.RawBody())
	var fullResponse strings.Builder
	var lastChunk ChatResponse

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		var chunk ChatResponse
		if err := json.Unmarshal([]byte(line), &chunk); err != nil {
			return nil, fmt.Errorf("failed to decode chunk: %w", err)
		}

		fullResponse.WriteString(chunk.Message.Content)
		lastChunk = chunk

		if onChunk != nil {
			if err := onChunk(&chunk); err != nil {
				return nil, err
			}
		}

		if chunk.Done {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading stream: %w", err)
	}

	lastChunk.Message.Role = "assistant"
	lastChunk.Message.Content = fullResponse.String()

	return &lastChunk, nil
}
