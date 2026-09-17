package user

import (
	"context"
	"errors"

	"llm-calling-with-streaming-and-context/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Repository interface {
	FindByEmail(ctx context.Context, email string) (*database.User, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*database.User, error)
	Create(ctx context.Context, user *database.User) error
}

type mongoRepository struct {
	coll *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &mongoRepository{
		coll: db.Collection("users"),
	}
}

func (r *mongoRepository) FindByEmail(ctx context.Context, email string) (*database.User, error) {
	var user database.User
	err := r.coll.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) FindByID(ctx context.Context, id bson.ObjectID) (*database.User, error) {
	var user database.User
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) Create(ctx context.Context, user *database.User) error {
	_, err := r.coll.InsertOne(ctx, user)
	return err
}
