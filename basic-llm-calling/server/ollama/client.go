package ollama

import "github.com/go-resty/resty/v2"

type Client struct {
	http *resty.Client
}

func NewClient(baseURL string) *Client {
	return &Client{http: resty.New().SetBaseURL(baseURL)}
}
