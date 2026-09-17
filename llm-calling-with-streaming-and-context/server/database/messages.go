package database

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Message struct {
	ID           bson.ObjectID `bson:"_id,omitempty"`
	ChatID       bson.ObjectID `bson:"chat_id"`
	UserChat     string        `bson:"user_chat"`
	LLMResponse  string        `bson:"llm_response"`
	CreatedAt    time.Time     `bson:"created_at"`
	UpdatedAt    time.Time     `bson:"updated_at"`
}