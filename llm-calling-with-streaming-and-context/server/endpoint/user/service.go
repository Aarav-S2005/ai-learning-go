package user

import (
	"context"
	"errors"
	"strings"
	"time"

	"llm-calling-with-streaming-and-context/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotFound       = errors.New("user not found")
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) Register(ctx context.Context, req RegisterRequest) (*database.User, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.Name)
	if email == "" || req.Password == "" || name == "" {
		return nil, errors.New("name, email, and password are required")
	}

	_, err := s.repo.FindByEmail(ctx, email)
	if err == nil {
		return nil, ErrUserAlreadyExists
	} else if !errors.Is(err, ErrUserNotFound) {
		return nil, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	newUser := database.User{
		ID:        bson.NewObjectID(),
		Name:      name,
		Email:     email,
		Password:  string(hashedPassword),
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.Create(ctx, &newUser); err != nil {
		return nil, err
	}

	return &newUser, nil
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*database.User, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" {
		return nil, errors.New("email and password are required")
	}

	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

func (s *Service) GetUserByID(ctx context.Context, id bson.ObjectID) (*database.User, error) {
	return s.repo.FindByID(ctx, id)
}
