package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type contextKey string

const (
	UserIDContextKey contextKey = "user_id"
	AuthCookieName   string     = "auth_token"
)

var (
	ErrUnauthorized = errors.New("unauthorized: missing or invalid authentication credentials")
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string

		if cookie, err := r.Cookie(AuthCookieName); err == nil && cookie.Value != "" {
			tokenStr = cookie.Value
		}

		if tokenStr == "" {
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenStr == "" {
			http.Error(w, `{"error":"unauthorized: missing authentication token"}`, http.StatusUnauthorized)
			return
		}

		userID, err := bson.ObjectIDFromHex(tokenStr)
		if err != nil {
			http.Error(w, `{"error":"unauthorized: invalid session token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(ctx context.Context) (bson.ObjectID, error) {
	val := ctx.Value(UserIDContextKey)
	if val == nil {
		return bson.NilObjectID, ErrUnauthorized
	}
	userID, ok := val.(bson.ObjectID)
	if !ok || userID.IsZero() {
		return bson.NilObjectID, ErrUnauthorized
	}
	return userID, nil
}
