package repository

import (
	"clouding/backend/internal/model/credential"
	"context"
	"database/sql"
	_ "embed"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
)

type CredentialRepository interface {
	GetCredential(ctx context.Context, id int) (*credential.Credential, error)
	GetAllCredentials(ctx context.Context, userId int) ([]*credential.Credential, error)
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
	db *sqlx.DB
}

func NewCredentialRepository(db *sqlx.DB) CredentialRepository {
	return &credentialRepository{db: db}
}

func (r *credentialRepository) GetCredential(ctx context.Context, id int) (*credential.Credential, error) {
	var cred credential.Credential
	err := r.db.GetContext(ctx, &cred, getCredentialByIdQuery, id)
	if err != nil {
		return nil, err
	}
	return &cred, nil
}

func (r *credentialRepository) GetAllCredentials(ctx context.Context, userId int) ([]*credential.Credential, error) {
	var creds []*credential.Credential
	err := r.db.SelectContext(ctx, &creds, getCredentialsByUserIdQuery, userId)
	if err != nil {
		return nil, err
	}
	if len(creds) == 0 {
		return nil, sql.ErrNoRows
	}
	return creds, nil
}

func (r *credentialRepository) CreateCredential(ctx context.Context, c *credential.Credential) error {
	rows, err := r.db.NamedQueryContext(ctx, createCredentialQuery, c)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		return rows.Scan(&c.ID)
	}
	return sql.ErrNoRows
}

func (r *credentialRepository) UpdateCredential(ctx context.Context, c *credential.Credential) error {
	builder := sq.
		Update("credentials").
		Set("updated_at", "NOW()").
		Where(sq.Eq{"id": c.ID}).
		Suffix("RETURNING updated_at").
		PlaceholderFormat(sq.Dollar)

	if c.Type != nil {
		builder = builder.Set("type", *c.Type)
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

	return nil
}

func (r *credentialRepository) DeleteCredential(ctx context.Context, id int) error {
	result, err := r.db.ExecContext(ctx, deleteCredentialByIdQuery, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
