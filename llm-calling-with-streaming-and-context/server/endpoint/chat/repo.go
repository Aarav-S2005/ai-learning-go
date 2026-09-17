package chat

import (
	"context"
	"errors"
	"time"

	"llm-calling-with-streaming-and-context/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Repository interface {
	ListChats(ctx context.Context, userID bson.ObjectID) ([]database.Chat, error)
	FindChatByIDAndUserID(ctx context.Context, chatID, userID bson.ObjectID) (*database.Chat, error)
	CreateChat(ctx context.Context, chat *database.Chat) error
	UpdateChatUpdatedAt(ctx context.Context, chatID bson.ObjectID, updatedAt time.Time) error
	FindMessagesByChatID(ctx context.Context, chatID bson.ObjectID) ([]database.Message, error)
	CreateMessage(ctx context.Context, message *database.Message) error
}

type mongoRepository struct {
	chatsColl    *mongo.Collection
	messagesColl *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &mongoRepository{
		chatsColl:    db.Collection("chats"),
		messagesColl: db.Collection("messages"),
	}
}

func (r *mongoRepository) ListChats(ctx context.Context, userID bson.ObjectID) ([]database.Chat, error) {
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}})
	cursor, err := r.chatsColl.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var chats []database.Chat
	if err := cursor.All(ctx, &chats); err != nil {
		return nil, err
	}
	if chats == nil {
		chats = []database.Chat{}
	}
	return chats, nil
}

func (r *mongoRepository) FindChatByIDAndUserID(ctx context.Context, chatID, userID bson.ObjectID) (*database.Chat, error) {
	var chat database.Chat
	err := r.chatsColl.FindOne(ctx, bson.M{"_id": chatID, "user_id": userID}).Decode(&chat)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrChatNotFound
		}
		return nil, err
	}
	return &chat, nil
}

func (r *mongoRepository) CreateChat(ctx context.Context, chat *database.Chat) error {
	_, err := r.chatsColl.InsertOne(ctx, chat)
	return err
}

func (r *mongoRepository) UpdateChatUpdatedAt(ctx context.Context, chatID bson.ObjectID, updatedAt time.Time) error {
	_, err := r.chatsColl.UpdateOne(
		ctx,
		bson.M{"_id": chatID},
		bson.M{"$set": bson.M{"updated_at": updatedAt}},
	)
	return err
}

func (r *mongoRepository) FindMessagesByChatID(ctx context.Context, chatID bson.ObjectID) ([]database.Message, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})
	cursor, err := r.messagesColl.Find(ctx, bson.M{"chat_id": chatID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var messages []database.Message
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	if messages == nil {
		messages = []database.Message{}
	}
	return messages, nil
}

func (r *mongoRepository) CreateMessage(ctx context.Context, message *database.Message) error {
	_, err := r.messagesColl.InsertOne(ctx, message)
	return err
}
