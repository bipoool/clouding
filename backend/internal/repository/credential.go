package repository

import (
	"clouding/backend/internal/model/credential"
	secretmanager "clouding/backend/internal/utils/secretManager"
	"context"
	"database/sql"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
)

type CredentialRepository interface {
	GetCredential(ctx context.Context, id int) (*credential.Credential, error)
	GetAllCredentials(ctx context.Context, userId string) ([]*credential.Credential, error)
	CreateCredential(ctx context.Context, c *credential.Credential) error
	UpdateCredential(ctx context.Context, c *credential.Credential) error
	DeleteCredential(ctx context.Context, id int) error
}

// Queries

//go:embed sql/credential/getCredentialById.sql
var getCredentialByIdQuery string

//go:embed sql/credential/getCredentialsByUserId.sql
var getCredentialsByUserIdQuery string

//go:embed sql/credential/createCredential.sql
var createCredentialQuery string

//go:embed sql/credential/deleteCredentialById.sql
var deleteCredentialByIdQuery string

type credentialRepository struct {
	db             *sqlx.DB
	secretsManager secretmanager.SecretsManager
}

func NewCredentialRepository(db *sqlx.DB, secretsManager secretmanager.SecretsManager) CredentialRepository {
	return &credentialRepository{db: db, secretsManager: secretsManager}
}

func (r *credentialRepository) GetCredential(ctx context.Context, id int) (*credential.Credential, error) {
	var cred credential.Credential
	err := r.db.GetContext(ctx, &cred, getCredentialByIdQuery, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	secret, err := r.secretsManager.GetSecret(getSecretNameFromCred(&cred))
	if err != nil {
		return &cred, err
	}
	err = json.Unmarshal([]byte(secret), &cred.Secret)

	if err != nil {
		return &cred, err
	}

	return &cred, nil
}

func (r *credentialRepository) GetAllCredentials(ctx context.Context, userId string) ([]*credential.Credential, error) {
	var creds []*credential.Credential
	err := r.db.SelectContext(ctx, &creds, getCredentialsByUserIdQuery, userId)
	if err != nil {
		return nil, err
	}

	for _, cred := range creds {
		secretJson, err := r.secretsManager.GetSecret(getSecretNameFromCred(cred))
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(secretJson), &cred.Secret); err != nil {
			return nil, err
		}
	}
	return creds, nil
}

func (r *credentialRepository) CreateCredential(ctx context.Context, c *credential.Credential) error {
	secretName := getSecretNameFromCred(c)

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareNamedContext(ctx, createCredentialQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()

	var id int
	if err := stmt.GetContext(ctx, &id, c); err != nil {
		return err
	}
	c.ID = &id
	if err := r.secretsManager.SetSecret(secretName, c.Secret); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		if delErr := r.secretsManager.DeleteSecret(secretName); delErr != nil {
			slog.Error("DB commit failed AND secret rollback failed",
				"secretName", secretName,
				"commitError", err.Error(),
				"deleteError", delErr.Error(),
			)
			return err
		}

		slog.Error("DB commit failed, secret deleted",
			"secretName", secretName,
			"error", err.Error(),
		)
		return err
	}

	return nil
}

func (r *credentialRepository) UpdateCredential(ctx context.Context, c *credential.Credential) error {
	secretName := getSecretNameFromCred(c)
	fmt.Printf(secretName)
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	builder := sq.
		Update("credentials").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": c.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	if c.Type != nil {
		builder = builder.Set("type", *c.Type)
	}

	if c.ExpiresAt != nil {
		builder = builder.Set("expires_at", *c.ExpiresAt)
	}

	query, args, err := builder.ToSql()

	if err != nil {
		return err
	}

	var updatedAt time.Time
	if err := r.db.GetContext(ctx, &updatedAt, query, args...); err != nil {
		return err
	}
	c.UpdatedAt = &updatedAt
	secretJSON, _ := json.MarshalIndent(c.Secret, "", "  ")
	fmt.Println("Secret Payload:", string(secretJSON))
	if err := r.secretsManager.UpdateSecret(secretName, c.Secret); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		slog.Error("DB commit failed, but secret already updated", "secretName", secretName, "err", err)
		return err
	}

	return nil
}

func (r *credentialRepository) DeleteCredential(ctx context.Context, id int) error {
	cred, err := r.GetCredential(ctx, id)
	if err != nil {
		return fmt.Errorf("fetch credential: %w", err)
	}
	if cred == nil {
		return sql.ErrNoRows
	}
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(ctx, deleteCredentialByIdQuery, id)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	if err := r.secretsManager.DeleteSecret(getSecretNameFromCred(cred)); err != nil {
		return err
	}
	if err := tx.Commit(); err != nil {

		slog.Error("DB commit failed, but secret already deleted",
			"secretName", *cred.Name,
			"error", err.Error(),
		)
		return fmt.Errorf("commit failed after secret delete: %w", err)
	}

	return nil
}

func getSecretNameFromCred(cred *credential.Credential) string {
	return *cred.Name  + "-" + *cred.UserID
}
