package ollama

import "github.com/go-resty/resty/v2"

type Client struct {
	http         *resty.Client
	defaultModel string
}

func NewClient(baseURL string, defaultModel ...string) *Client {
	model := "llama3"
	if len(defaultModel) > 0 && defaultModel[0] != "" {
		model = defaultModel[0]
	}
	return &Client{
		http:         resty.New().SetBaseURL(baseURL),
		defaultModel: model,
	}
}

