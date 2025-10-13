package db

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"
)

// APIKey represents an API key in the database
type APIKey struct {
	ID        int       `json:"id"`
	Key       string    `json:"key"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	RevokedAt *time.Time `json:"revoked_at,omitempty"`
}

// GenerateAPIKey generates a cryptographically secure random API key
func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32) // 32 bytes = 64 hex characters
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random key: %w", err)
	}
	return "sk_" + hex.EncodeToString(bytes), nil
}

// CreateAPIKey creates a new API key in the database
func CreateAPIKey(name string) (*APIKey, error) {
	key, err := GenerateAPIKey()
	if err != nil {
		return nil, err
	}

	result, err := DB.Exec(
		"INSERT INTO api_keys (key, name) VALUES (?, ?)",
		key, name,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert API key: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return &APIKey{
		ID:        int(id),
		Key:       key,
		Name:      name,
		CreatedAt: time.Now(),
	}, nil
}

// ValidateAPIKey checks if an API key is valid (exists and not revoked)
func ValidateAPIKey(key string) bool {
	var revokedAt sql.NullTime
	err := DB.QueryRow(
		"SELECT revoked_at FROM api_keys WHERE key = ?",
		key,
	).Scan(&revokedAt)

	if err != nil {
		return false // Key doesn't exist
	}

	return !revokedAt.Valid // Valid if not revoked
}

// GetAPIKey retrieves an API key by its key string
func GetAPIKey(key string) (*APIKey, error) {
	var apiKey APIKey
	var revokedAt sql.NullTime

	err := DB.QueryRow(
		"SELECT id, key, name, created_at, revoked_at FROM api_keys WHERE key = ?",
		key,
	).Scan(&apiKey.ID, &apiKey.Key, &apiKey.Name, &apiKey.CreatedAt, &revokedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("API key not found")
		}
		return nil, fmt.Errorf("failed to query API key: %w", err)
	}

	if revokedAt.Valid {
		apiKey.RevokedAt = &revokedAt.Time
	}

	return &apiKey, nil
}

// ListAPIKeys retrieves all API keys (excluding the key value for security)
func ListAPIKeys() ([]APIKey, error) {
	rows, err := DB.Query(
		"SELECT id, name, created_at, revoked_at FROM api_keys ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query API keys: %w", err)
	}
	defer rows.Close()

	var keys []APIKey
	for rows.Next() {
		var key APIKey
		var revokedAt sql.NullTime

		if err := rows.Scan(&key.ID, &key.Name, &key.CreatedAt, &revokedAt); err != nil {
			return nil, fmt.Errorf("failed to scan API key row: %w", err)
		}

		if revokedAt.Valid {
			key.RevokedAt = &revokedAt.Time
		}

		keys = append(keys, key)
	}

	return keys, nil
}

// RevokeAPIKey marks an API key as revoked
func RevokeAPIKey(id int) error {
	result, err := DB.Exec(
		"UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND revoked_at IS NULL",
		id,
	)
	if err != nil {
		return fmt.Errorf("failed to revoke API key: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("API key not found or already revoked")
	}

	return nil
}

// DeleteAPIKey permanently deletes an API key from the database
func DeleteAPIKey(id int) error {
	result, err := DB.Exec("DELETE FROM api_keys WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete API key: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("API key not found")
	}

	return nil
}
